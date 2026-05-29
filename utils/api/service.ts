import { z } from "zod";
import { browser } from "wxt/browser";
import messageBackground from "../browser/messageBackground";
import useLauncherStore from "@/utils/launcherStore";
import extractMenu from "./extractMenu";
import commands, { stopImpersonateCommand } from "../configs/commands";
import {
  SN_LAUNCHER_SEARCH_DOC_URL,
  SN_LAUNCHER_SEARCH_COMPONENT_URL,
  SN_LAUNCHER_SCOPE_ENDPOINT,
  SN_LAUNCHER_USER_ENDPOINT,
  SN_LAUNCHER_USER_PAGE_SIZE,
  SN_LAUNCHER_USER_MAX_PAGES,
  SN_LAUNCHER_USER_SEARCH_ENDPOINT,
  SN_LAUNCHER_UPDATE_SET_ENDPOINT,
  SN_LAUNCHER_UPDATE_SET_PICKER_ENDPOINT,
  SN_LAUNCHER_IMPERSONATE_ENDPOINT,
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
  UserRecordSchema,
  UpdateSetRecordSchema,
  HistoryResponseSchema,
  MenuItemSchema,
  SwitchAppResultSchema,
  referenceDisplay,
} from "./schemas";
import type { CommandItem } from "@/utils/types";

const TableListSchema = z.object({ result: z.array(TableRecordSchema) }).passthrough();
const ScopeListSchema = z.object({ result: z.array(ScopeRecordSchema) }).passthrough();
const UserListSchema = z.object({ result: z.array(UserRecordSchema) }).passthrough();
const CurrentUserSchema = z
  .object({ result: z.object({ user_sys_id: z.string().optional() }).passthrough() })
  .passthrough();
const UpdateSetListSchema = z.object({ result: z.array(UpdateSetRecordSchema) }).passthrough();
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

export async function fetchUpdateSets(): Promise<CommandItem[]> {
  // In-progress sets, scoped to the current app when we know it (mirrors the
  // platform picker, which only lists sets for the active scope). NOT cached —
  // devs create/switch sets constantly, so the list must stay live.
  const scope = useLauncherStore.getState().scopeSysId;
  const clause = scope ? `state=in progress^application=${scope}` : "state=in progress";
  const endpoint = `${SN_LAUNCHER_UPDATE_SET_ENDPOINT}&sysparm_query=${encodeURIComponent(
    `${clause}^ORDERBYDESCsys_updated_on`
  )}`;

  const res = await snFetchJSON(endpoint, UpdateSetListSchema);
  if (!res.ok) return [];
  return res.value.result
    .filter((item) => item.sys_id && item.name)
    .map((item) => {
      // Update set names alone (e.g. "Default") aren't distinct enough; show the
      // owning application scope as the subtitle to disambiguate.
      const app = referenceDisplay(item.application);
      return {
        key: `update_set:${item.sys_id}`,
        // palette-action.ts reads `sysId` + `label` to drive the picker PUT.
        sysId: item.sys_id!,
        label: item.name!,
        subLabel: app || "Set as current update set",
        fullLabel: item.name!,
      } satisfies CommandItem;
    });
}

// sys_user row → CommandItem. `sysId` is what palette-action reads to impersonate;
// fullLabel carries name+username+email so the client fuzzy filter matches all three.
function toUserItem(item: z.infer<typeof UserRecordSchema>): CommandItem | null {
  if (!item.sys_id || !item.name) return null;
  return {
    key: `user:${item.sys_id}`,
    sysId: item.sys_id,
    label: item.name,
    subLabel: item.user_name || item.email || "",
    fullLabel: [item.name, item.user_name, item.email].filter(Boolean).join(" "),
  };
}

export async function fetchUsers(): Promise<CommandItem[]> {
  // Paginated like fetchTables so the whole set is fuzzy-filtered client-side
  // (same experience as Tables/Scopes). Deliberately NOT cached — user records
  // are PII and active/role state must stay live.
  const out: CommandItem[] = [];
  for (let page = 0; page < SN_LAUNCHER_USER_MAX_PAGES; page++) {
    const offset = page * SN_LAUNCHER_USER_PAGE_SIZE;
    const endpoint = `${SN_LAUNCHER_USER_ENDPOINT}&sysparm_limit=${SN_LAUNCHER_USER_PAGE_SIZE}&sysparm_offset=${offset}`;
    const res = await snFetchJSON(endpoint, UserListSchema);
    if (!res.ok) break;

    const rows = res.value.result;
    for (const item of rows) {
      const mapped = toUserItem(item);
      if (mapped) out.push(mapped);
    }

    // Last page reached when ServiceNow returned fewer than a full page.
    if (rows.length < SN_LAUNCHER_USER_PAGE_SIZE) break;
  }
  return out;
}

/**
 * Bounded server-side user lookup — the fallback for Impersonate mode when the
 * typed text matches nobody in the loaded list (eg. a user past the fetch cap).
 * Substring (LIKE) match across name/user_name/email, capped at 30 rows. Returns
 * real, selectable users so we never impersonate raw typed text.
 */
export async function searchUsers(query: string): Promise<CommandItem[]> {
  // Strip ServiceNow encoded-query metacharacters so typed text can't alter the
  // query structure.
  const q = query.trim().replace(/[\^=,]/g, "");
  if (!q) return [];

  // `^NQ` OR-joins query groups, so active=true is re-applied to each LIKE branch
  // (a plain `^OR` would drop the active filter from the OR'd conditions).
  const clause = ["name", "user_name", "email"]
    .map((field) => `active=true^${field}LIKE${q}`)
    .join("^NQ");
  const endpoint = `${SN_LAUNCHER_USER_SEARCH_ENDPOINT}&sysparm_query=${encodeURIComponent(
    `${clause}^ORDERBYname`
  )}`;

  const res = await snFetchJSON(endpoint, UserListSchema, { surfaceError: false });
  if (!res.ok) return [];
  return res.value.result.map(toUserItem).filter((item): item is CommandItem => item !== null);
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
          sysId: item.sys_id,
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
  const visible = commands.filter((command) => command.visible !== false);
  // Surface "Stop impersonating" only while an extension-initiated impersonation
  // is active (the origin admin sys_id was persisted when impersonating). Both
  // impersonate and stop reload the page, so this is re-evaluated fresh each load.
  const origin = await getImpersonationOrigin();
  return origin ? [...visible, stopImpersonateCommand] : visible;
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

// "Stop impersonating" reverts by re-impersonating the original admin — but the
// impersonated session can't read who that was. So when we start an impersonation
// we stash the admin's sys_id here (survives the reload + invalidateAll, which
// only clears `snl:cache:` keys). Host-scoped, since impersonation is per-instance.
const IMPERSONATION_ORIGIN_PREFIX = "snl:imp-origin:";

function impersonationOriginKey(): string {
  return `${IMPERSONATION_ORIGIN_PREFIX}${getHost()}`;
}

export async function getImpersonationOrigin(): Promise<string | null> {
  try {
    const k = impersonationOriginKey();
    const res = await browser.storage.local.get(k);
    return (res[k] as string | undefined) ?? null;
  } catch {
    return null;
  }
}

async function setImpersonationOrigin(sysId: string): Promise<void> {
  try {
    await browser.storage.local.set({ [impersonationOriginKey()]: sysId });
  } catch {
    /* ignore quota errors */
  }
}

async function clearImpersonationOrigin(): Promise<void> {
  try {
    await browser.storage.local.remove(impersonationOriginKey());
  } catch {
    /* ignore */
  }
}

// Timing-independent way to learn the current user's sys_id (the main-world
// g_user.userID capture can be late or, on some UIs, absent). surfaceError:false
// so a miss here never pops the palette's error state.
async function fetchCurrentUserSysId(): Promise<string | null> {
  const res = await snFetchJSON("api/now/ui/user/current_user", CurrentUserSchema, {
    surfaceError: false,
  });
  return res.ok ? res.value.result.user_sys_id ?? null : null;
}

// `identifier` is a sys_id or a username — the endpoint accepts both. Encoded so
// usernames containing @/+/. survive the path (hex sys_ids pass through unchanged).
function postImpersonate(identifier: string, token: string): Promise<Response> {
  return fetch(
    `${getBaseUrl()}/${SN_LAUNCHER_IMPERSONATE_ENDPOINT}/${encodeURIComponent(identifier)}`, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: {
      "x-usertoken": token,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
}

export async function impersonateUserById(sysId: string): Promise<void> {
  try {
    if (!sysId) return;

    const token = useLauncherStore.getState().token;
    if (!token) return;

    // Capture the current (admin) identity BEFORE impersonating — afterwards the
    // session is the impersonated user, so current_user would return the wrong id.
    // Fast path: the main-world g_user.userID snapshot; fallback: a REST lookup.
    const adminSysId =
      useLauncherStore.getState().userSysId ?? (await fetchCurrentUserSysId());

    const res = await postImpersonate(sysId, token);

    // Unlike switchToAppById we do NOT reload on failure — if impersonation was
    // rejected (insufficient rights, restricted target) the admin should stay put.
    if (!res.ok) throw new Error(`impersonateUserById: HTTP ${res.status}`);

    // Remember the true admin so "Stop impersonating" can revert. Preserve the
    // FIRST origin so chained impersonations still return to the real admin.
    if (adminSysId && !(await getImpersonationOrigin())) {
      await setImpersonationOrigin(adminSysId);
    }

    // Roles, menus, scope and history all change with the impersonated identity —
    // drop our caches and let ServiceNow rebuild its own state via a reload.
    await invalidateAll();
    window?.top?.location?.reload();
  } catch (error) {
    console.error("SN Launcher: impersonateUserById failed:", error);
  }
}

export async function stopImpersonating(): Promise<void> {
  try {
    const origin = await getImpersonationOrigin();
    if (!origin) return; // not impersonating via the extension — nothing to revert

    // If we're already the origin user, impersonation was ended elsewhere (eg. the
    // OOB "End Impersonation"). Just drop the stale flag — no POST, no reload.
    if (useLauncherStore.getState().userSysId === origin) {
      await clearImpersonationOrigin();
      return;
    }

    const token = useLauncherStore.getState().token;
    if (!token) return;

    const res = await postImpersonate(origin, token);
    if (!res.ok) throw new Error(`stopImpersonating: HTTP ${res.status}`);

    await clearImpersonationOrigin();
    await invalidateAll();
    window?.top?.location?.reload();
  } catch (error) {
    console.error("SN Launcher: stopImpersonating failed:", error);
  }
}

export async function switchUpdateSet(sysId: string, name: string): Promise<void> {
  try {
    if (!sysId || !name) return;

    const token = useLauncherStore.getState().token;
    if (!token) return;

    const endpoint = `${getBaseUrl()}/${SN_LAUNCHER_UPDATE_SET_PICKER_ENDPOINT}`;
    const res = await fetch(endpoint, {
      method: "PUT",
      mode: "cors",
      credentials: "include",
      headers: {
        "x-usertoken": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Picker expects both the display name and sys_id.
      body: JSON.stringify({ name, sysId }),
    });

    if (!res.ok) throw new Error(`switchUpdateSet: HTTP ${res.status}`);

    // The set is a session preference, applied server-side immediately — but the
    // page's own update-set picker won't reflect it until a reload. (No cache
    // invalidation: menus/tables/scopes don't change with the update set.)
    window?.top?.location?.reload();
  } catch (error) {
    console.error("SN Launcher: switchUpdateSet failed:", error);
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

export function copyLink(segmentUrl: string): void {
  const url = `${getBaseUrl()}/${segmentUrl}`;
  navigator.clipboard.writeText(url).catch((err) => {
    console.error("SN Launcher: copy to clipboard failed:", err);
  });
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
