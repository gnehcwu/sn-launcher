import messageBackground from "../browser/messageBackground";
import { SN_LAUNCHER_ACTIONS } from "../configs/constants";

export interface RecordContext {
  table: string;
  sysId: string;
}

const SYS_ID_PATTERN = /^[0-9a-f]{32}$/i;
const TABLE_PATTERN = /^[a-z][a-z0-9_]*$/i;

function makeContext(table: string, sysId: string): RecordContext | null {
  if (!table || !TABLE_PATTERN.test(table)) return null;
  const normalized = sysId?.trim().toLowerCase();
  if (!normalized || !SYS_ID_PATTERN.test(normalized)) return null;
  return { table, sysId: normalized };
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function fromDoTarget(target: string): RecordContext | null {
  const decoded = safeDecode(target);
  const m = decoded.match(/^([a-z][a-z0-9_]*)\.do(?:\?(.*))?$/i);
  if (!m) return null;
  const params = new URLSearchParams(m[2] ?? "");
  const sysId = params.get("sys_id");
  return sysId ? makeContext(m[1], sysId) : null;
}

/**
 * Best-effort extraction of (table, sysId) from a ServiceNow URL.
 * Covers classic UI16 (direct form, nav_to.do, and now/nav/ui/classic wrappers)
 * and Now Experience workspace patterns (.../record/<table>/<sys_id>).
 */
export function extractRecordFromUrl(url: string | undefined | null): RecordContext | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const path = parsed.pathname.replace(/^\/+/, "");

  // Direct form: <table>.do?sys_id=...
  const direct = path.match(/^([a-z][a-z0-9_]*)\.do$/i);
  if (direct) {
    const sysId = parsed.searchParams.get("sys_id");
    if (sysId) {
      const ctx = makeContext(direct[1], sysId);
      if (ctx) return ctx;
    }
  }

  // Classic nav frame: nav_to.do?uri=<table>.do?sys_id=...
  if (/^nav_to\.do$/i.test(path)) {
    const uri = parsed.searchParams.get("uri");
    if (uri) {
      const ctx = fromDoTarget(uri);
      if (ctx) return ctx;
    }
  }

  // now/nav/ui/classic/params/target/<table>.do?sys_id=...
  const classicTarget = path.match(/^now\/nav\/ui\/classic\/params\/target\/(.+)$/i);
  if (classicTarget) {
    const ctx = fromDoTarget(classicTarget[1]);
    if (ctx) return ctx;
  }

  // Workspace path: .../record/<table>/<sys_id>
  const wsPath = path.match(/(?:^|\/)record\/([a-z][a-z0-9_]*)\/([0-9a-f]{32})(?:\/|$)/i);
  if (wsPath) {
    const ctx = makeContext(wsPath[1], wsPath[2]);
    if (ctx) return ctx;
  }

  // Workspace hash: ...#/record/<table>/<sys_id>
  if (parsed.hash) {
    const hashMatch = parsed.hash.match(/(?:^|\/)record\/([a-z][a-z0-9_]*)\/([0-9a-f]{32})(?:\/|$)/i);
    if (hashMatch) {
      const ctx = makeContext(hashMatch[1], hashMatch[2]);
      if (ctx) return ctx;
    }
  }

  return null;
}

/**
 * Resolves the record currently visible to the user. Checks the top frame's URL
 * first (covers workspace and direct UI16 form URLs), then walks same-origin
 * iframes (covers UI16's gsft_main wrapper, where the record URL lives in the
 * embedded frame rather than the address bar).
 */
export function getCurrentRecord(): RecordContext | null {
  if (typeof window === "undefined") return null;

  const fromTop = extractRecordFromUrl(window.location.href);
  if (fromTop) return fromTop;

  try {
    const iframes = document.querySelectorAll("iframe");
    for (const iframe of iframes) {
      let src: string | undefined;
      try {
        src = iframe.contentWindow?.location.href;
      } catch {
        // cross-origin frame — skip
        continue;
      }
      if (!src || src === "about:blank") continue;
      const ctx = extractRecordFromUrl(src);
      if (ctx) return ctx;
    }
  } catch {
    /* ignore */
  }

  return null;
}

export function buildXmlUrl(origin: string, ctx: RecordContext): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/${ctx.table}.do?sys_id=${ctx.sysId}&sysparm_stack=&sysparm_view=&XML`;
}

/**
 * Detects the current record and opens its XML view in a new tab.
 * No-ops silently if no record is detected on the page.
 */
export function showCurrentRecordXml(): void {
  const ctx = getCurrentRecord();
  if (!ctx) return;

  const xmlUrl = buildXmlUrl(window.location.origin, ctx);
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url: xmlUrl });
}
