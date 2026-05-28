import useLauncherStore from "@/utils/launcherStore";
import {
  SN_LAUNCHER_RECAPTURE_GCK_EVENT,
  SN_LAUNCHER_SCRIPT_ENDPOINT,
  SN_LAUNCHER_GLOBAL_SCOPE_SYS_ID,
} from "@/utils/configs/constants";
import type { LauncherError, Result } from "@/utils/types";
import type { z } from "zod";

const TOKEN_WAIT_TIMEOUT_MS = 3000;
const RECAPTURE_WAIT_TIMEOUT_MS = 1500;

export function getBaseUrl(): string {
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
}

export function getHost(): string {
  return window.location.host;
}

async function awaitTokenChange(currentToken: string, timeoutMs: number): Promise<string | null> {
  const state = useLauncherStore.getState();
  if (state.token && state.token !== currentToken) return state.token;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(token);
    };

    const unsubscribe = useLauncherStore.subscribe((next) => {
      if (next.token && next.token !== currentToken) finish(next.token);
    });

    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}

async function ensureToken(): Promise<string | null> {
  const token = useLauncherStore.getState().token;
  if (token) return token;
  return awaitTokenChange("", TOKEN_WAIT_TIMEOUT_MS);
}

function requestRecapture(): void {
  try {
    window.postMessage({ from: SN_LAUNCHER_RECAPTURE_GCK_EVENT }, "*");
  } catch {
    /* ignore */
  }
}

function setError(error: LauncherError | null): void {
  useLauncherStore.getState().setError(error);
}

function clearError(): void {
  if (useLauncherStore.getState().error) setError(null);
}

interface SnFetchOptions {
  /** When false, do not surface failures via setError (eg. background prefetches). */
  surfaceError?: boolean;
}

async function rawFetch(url: string, token: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    mode: "cors",
    credentials: "include",
    headers: {
      "x-usertoken": token,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

/**
 * Authenticated JSON GET against the current ServiceNow instance.
 * Handles 401 by requesting a g_ck recapture and retrying once.
 * Validates the response payload through a Zod schema and returns a discriminated Result.
 */
export async function snFetchJSON<T>(
  endpoint: string,
  schema: z.ZodType<T>,
  options: SnFetchOptions = {}
): Promise<Result<T>> {
  const { surfaceError = true } = options;

  const token = await ensureToken();
  if (!token) {
    const err: LauncherError = { kind: "auth", message: "Not signed in to ServiceNow." };
    if (surfaceError) setError(err);
    return { ok: false, error: err };
  }

  const url = `${getBaseUrl()}/${endpoint}`;
  let res: Response;
  try {
    res = await rawFetch(url, token);
  } catch (e) {
    const err: LauncherError = { kind: "network", message: "Network error reaching ServiceNow." };
    if (surfaceError) setError(err);
    return { ok: false, error: err };
  }

  if (res.status === 401 || res.status === 403) {
    requestRecapture();
    const newToken = await awaitTokenChange(token, RECAPTURE_WAIT_TIMEOUT_MS);
    if (!newToken) {
      const err: LauncherError = { kind: "auth", message: "Session expired. Reload the page." };
      if (surfaceError) setError(err);
      return { ok: false, error: err };
    }
    try {
      res = await rawFetch(url, newToken);
    } catch {
      const err: LauncherError = { kind: "network", message: "Network error after re-auth." };
      if (surfaceError) setError(err);
      return { ok: false, error: err };
    }
  }

  if (!res.ok) {
    const err: LauncherError = { kind: "server", message: `ServiceNow returned ${res.status}.` };
    if (surfaceError) setError(err);
    return { ok: false, error: err };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    const err: LauncherError = { kind: "schema", message: "Could not parse response." };
    if (surfaceError) setError(err);
    return { ok: false, error: err };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.warn("SN Launcher: schema mismatch", parsed.error.issues);
    const err: LauncherError = { kind: "schema", message: "Unexpected response shape." };
    if (surfaceError) setError(err);
    return { ok: false, error: err };
  }

  clearError();
  return { ok: true, value: parsed.data };
}

/**
 * POST to sys.scripts.do with a snapshot of the user's current scope (so server-side
 * GlideRecord queries respect the scope set in their session, not a hardcoded one).
 */
export async function snRunScript(script: string): Promise<Result<string>> {
  const token = await ensureToken();
  if (!token) {
    return { ok: false, error: { kind: "auth", message: "Not signed in to ServiceNow." } };
  }

  const url = `${getBaseUrl()}/${SN_LAUNCHER_SCRIPT_ENDPOINT}`;
  const scope = useLauncherStore.getState().scopeSysId ?? SN_LAUNCHER_GLOBAL_SCOPE_SYS_ID;
  const body = new URLSearchParams({
    script,
    runscript: "Run script",
    sysparm_ck: token,
    sys_scope: scope,
    quota_managed_transaction: "on",
  }).toString();

  try {
    const res = await fetch(url, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) {
      return { ok: false, error: { kind: "server", message: `Script returned ${res.status}.` } };
    }
    const text = await res.text();
    return { ok: true, value: text };
  } catch {
    return { ok: false, error: { kind: "network", message: "Network error running script." } };
  }
}

