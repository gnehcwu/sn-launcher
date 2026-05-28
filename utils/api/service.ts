import { z } from "zod";
import messageBackground from "../browser/messageBackground";
import useLauncherStore from "@/utils/launcherStore";
import extractMenu from "./extractMenu";
import commands from "../configs/commands";
import {
  SN_LAUNCHER_SEARCH_DOC_URL,
  SN_LAUNCHER_SEARCH_COMPONENT_URL,
  SN_LAUNCHER_SCOPE_ENDPOINT,
  SN_LAUNCHER_TABLE_ENDPOINT,
  SN_LAUNCHER_TABLE_PAGE_SIZE,
  SN_LAUNCHER_TABLE_MAX_PAGES,
  SN_LAUNCHER_MENU_ENDPOINT,
  SN_LAUNCHER_HISTORY_ENDPOINT,
  SN_LAUNCHER_SWITCH_APP_ENDPOINT,
  SN_LAUNCHER_TAB_PREFIX,
  SN_LAUNCHER_ACTIONS,
  SN_LAUNCHER_ABOUT_URL,
  SN_LAUNCHER_HISTORY_MAX_ITEMS,
  SN_LAUNCHER_CACHE_TTL_MS,
} from "../configs/constants";
import { snFetchJSON, getBaseUrl, getHost } from "./snFetch";
import { readFresh, writeCache, invalidate, invalidateAll } from "./cache";
import {
  ScopeRecordSchema,
  TableRecordSchema,
  HistoryResponseSchema,
  MenuItemSchema,
  SwitchAppResultSchema,
} from "./schemas";
import type { CommandItem } from "@/utils/types";

const TableListSchema = z.object({ result: z.array(TableRecordSchema) }).passthrough();
const ScopeListSchema = z.object({ result: z.array(ScopeRecordSchema) }).passthrough();
const MenuListSchema = z.object({ result: z.array(MenuItemSchema) }).passthrough();
const HistoryEnvelopeSchema = z.object({ result: HistoryResponseSchema }).passthrough();

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export async function fetchHistory(): Promise<CommandItem[]> {
  const res = await snFetchJSON(SN_LAUNCHER_HISTORY_ENDPOINT, HistoryEnvelopeSchema);
  if (!res.ok) return [];
  const list = res.value.result.list ?? [];
  return list
    .filter((item) => item.id != null)
    .slice(0, SN_LAUNCHER_HISTORY_MAX_ITEMS)
    .map((item) => ({
      key: `history:${item.id}`,
      fullLabel: item.prettyTitle ?? item.title ?? String(item.id),
      subLabel: item.url || item.description || item.title || "",
      target: item.url,
      parentLabel: item.timestamp != null ? formatDate(item.timestamp) : undefined,
    }));
}

type OnRevalidate = (fresh: CommandItem[]) => void;

async function cachedList(
  endpoint: string,
  build: () => Promise<CommandItem[]>,
  onRevalidate?: OnRevalidate
): Promise<CommandItem[]> {
  const host = getHost();
  const cached = await readFresh<CommandItem[]>(host, endpoint, SN_LAUNCHER_CACHE_TTL_MS);

  if (cached && cached.length) {
    // SWR: serve cache now, refresh in background so plugin install/uninstall
    // (or any backend change) self-corrects on the next render.
    void (async () => {
      try {
        const fresh = await build();
        if (!fresh.length) return;
        await writeCache(host, endpoint, fresh);
        onRevalidate?.(fresh);
      } catch {
        /* ignore — keep serving cache */
      }
    })();
    return cached;
  }

  const fresh = await build();
  if (fresh.length) {
    await writeCache(host, endpoint, fresh);
  } else {
    // Don't let a stale empty cache pin the user to an empty list.
    await invalidate(host, endpoint);
  }
  return fresh;
}

export async function fetchScopes(onRevalidate?: OnRevalidate): Promise<CommandItem[]> {
  return cachedList("scopes", async () => {
    const res = await snFetchJSON(SN_LAUNCHER_SCOPE_ENDPOINT, ScopeListSchema);
    if (!res.ok) return [];
    return res.value.result
      .filter((item) => item.sys_id)
      .map((item) => {
        const displayLabel = item.name || item.scope || item.sys_id!;
        // `key` must be the raw sys_id: palette-action.ts passes it straight to
        // switchToAppById, which forwards it to ServiceNow as the `app_id`.
        return {
          key: item.sys_id!,
          label: displayLabel,
          subLabel: `Switch to scope ${item.scope || displayLabel}`,
          fullLabel: `${item.name ?? ""} ${item.scope ?? ""}`.trim() || displayLabel,
        } satisfies CommandItem;
      });
  }, onRevalidate);
}

export async function fetchTables(onRevalidate?: OnRevalidate): Promise<CommandItem[]> {
  return cachedList("tables", async () => {
    const out: CommandItem[] = [];
    for (let page = 0; page < SN_LAUNCHER_TABLE_MAX_PAGES; page++) {
      const offset = page * SN_LAUNCHER_TABLE_PAGE_SIZE;
      const endpoint = `${SN_LAUNCHER_TABLE_ENDPOINT}&sysparm_limit=${SN_LAUNCHER_TABLE_PAGE_SIZE}&sysparm_offset=${offset}`;
      const res = await snFetchJSON(endpoint, TableListSchema);
      if (!res.ok) break;

      const rows = res.value.result;
      for (const item of rows) {
        if (!item.name || !item.label) continue;
        out.push({
          key: `table:${item.name}`,
          label: item.label,
          fullLabel: `${item.label} ${item.name}`,
          target: `${item.name}_list.do`,
        });
      }

      // Last page reached when ServiceNow returned fewer than a full page.
      if (rows.length < SN_LAUNCHER_TABLE_PAGE_SIZE) break;
    }
    return out;
  }, onRevalidate);
}

export async function fetchMenus(onRevalidate?: OnRevalidate): Promise<CommandItem[]> {
  return cachedList("menus", async () => {
    const res = await snFetchJSON(SN_LAUNCHER_MENU_ENDPOINT, MenuListSchema);
    if (!res.ok) return [];
    const subItems = (res.value.result?.[0]?.subItems ?? []) as Parameters<typeof extractMenu>[0];
    return extractMenu(subItems);
  }, onRevalidate);
}

export async function fetchCommands(): Promise<CommandItem[]> {
  return commands.filter((command) => command.visible !== false);
}

export async function clearCache(): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  tasks.push(
    (async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    })()
  );

  tasks.push(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch {
        /* ignore */
      }
    })()
  );

  // IndexedDB intentionally NOT cleared — ServiceNow caches its own UI
  // metadata there (UI Builder, Service Portal, workspace defs). Deleting it
  // leaves the next page load with an empty store, which ServiceNow's
  // bootstrap can't recover from in-place (blank screen / endless spinner).
  // Drop our own extension-storage cache so the palette picks up new data.
  tasks.push(invalidateAll());

  try {
    await Promise.all(tasks);
  } finally {
    window?.top?.location?.reload();
  }
}

export async function switchToAppById(appId: string): Promise<void> {
  try {
    if (!appId) return;

    const token = useLauncherStore.getState().token;
    if (!token) return;

    const endpoint = `${getBaseUrl()}/${SN_LAUNCHER_SWITCH_APP_ENDPOINT}`;
    const res = await fetch(endpoint, {
      method: "PUT",
      mode: "cors",
      credentials: "include",
      headers: {
        "x-usertoken": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ app_id: appId }),
    });

    if (!res.ok) throw new Error(`switchToAppById: HTTP ${res.status}`);

    const json = await res.json();
    const parsed = SwitchAppResultSchema.safeParse(json);
    if (parsed.success && !parsed.data.error) {
      // Drop our own cache (menus/tables differ per scope) and let ServiceNow
      // rebuild its own state via a normal reload. Wiping localStorage /
      // IndexedDB here breaks ServiceNow's first paint until another tab
      // repopulates the origin's IndexedDB.
      await invalidateAll();
      window?.top?.location?.reload();
    }
  } catch (error) {
    console.error("SN Launcher: switchToAppById failed:", error);
    window?.top?.location?.reload();
  }
}

export function searchDoc(input: string): void {
  const url = `${SN_LAUNCHER_SEARCH_DOC_URL}${encodeURIComponent(input)}`;
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url });
}

export function searchComponent(input: string): void {
  const url = `${SN_LAUNCHER_SEARCH_COMPONENT_URL}${encodeURIComponent(input)}`;
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url });
}

export function gotoTab(segmentUrl: string): void {
  const url = `${getBaseUrl()}/${segmentUrl}`;
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url });
}

export function goto(segment: string): void {
  const matched = segment.match(/(.+)\.(do|list)$/);
  if (matched && matched[1]) {
    const target = matched[1];
    const suffix = matched[2];
    if (suffix === "list") {
      gotoTab(`${SN_LAUNCHER_TAB_PREFIX}${target}_list.do`);
    } else {
      gotoTab(`${SN_LAUNCHER_TAB_PREFIX}${target}.do`);
    }
    return;
  }
  gotoTab(`${SN_LAUNCHER_TAB_PREFIX}${segment}`);
}

export function about(): void {
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url: SN_LAUNCHER_ABOUT_URL });
}

export function openOptions(): void {
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_OPTIONS_COMMAND });
}
