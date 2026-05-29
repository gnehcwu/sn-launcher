import { browser } from "wxt/browser";

const PREFIX = "snl:cache:";

interface CacheEntry<T> {
  t: number;
  v: T;
}

function key(host: string, endpoint: string): string {
  return `${PREFIX}${host}:${endpoint}`;
}

async function read<T>(k: string): Promise<CacheEntry<T> | null> {
  try {
    const res = await browser.storage.local.get(k);
    const hit = res[k] as CacheEntry<T> | undefined;
    return hit ?? null;
  } catch {
    return null;
  }
}

async function write<T>(k: string, value: T): Promise<void> {
  try {
    const payload: CacheEntry<T> = { t: Date.now(), v: value };
    await browser.storage.local.set({ [k]: payload });
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Read a cached value if it exists and hasn't expired. Useful when the caller
 * wants to decide whether to write back (eg. skip writing empty results).
 */
export async function readFresh<T>(
  host: string,
  endpoint: string,
  ttlMs: number
): Promise<T | null> {
  const hit = await readFreshWithAge<T>(host, endpoint, ttlMs);
  return hit ? hit.value : null;
}

export interface CacheHit<T> {
  value: T;
  /** Wall-clock time the entry was written (ms epoch). */
  writtenAt: number;
  /** How long ago the entry was written (ms). */
  ageMs: number;
}

/**
 * Like {@link readFresh} but also reports the entry's age, so callers can apply
 * a stale-while-revalidate window (serve fresh-enough cache without refetching).
 */
export async function readFreshWithAge<T>(
  host: string,
  endpoint: string,
  ttlMs: number
): Promise<CacheHit<T> | null> {
  const hit = await read<T>(key(host, endpoint));
  if (!hit) return null;
  const ageMs = Date.now() - hit.t;
  if (ageMs >= ttlMs) return null;
  return { value: hit.v, writtenAt: hit.t, ageMs };
}

// Timestamp of the last "the user might have changed something elsewhere"
// signal (tab focus / visibility regain). Cache entries written before this
// are revalidated on their next read even if still inside the stale window —
// so returning from a plugin install refreshes the palette on the next open.
let lastRevalidationTrigger = 0;

/** Mark that an external change may have happened (call on tab focus). */
export function markRevalidationTrigger(): void {
  lastRevalidationTrigger = Date.now();
}

/** Epoch ms of the most recent revalidation trigger (0 if none yet). */
export function getRevalidationTrigger(): number {
  return lastRevalidationTrigger;
}

export async function writeCache<T>(host: string, endpoint: string, value: T): Promise<void> {
  await write(key(host, endpoint), value);
}

export async function invalidateAll(): Promise<void> {
  try {
    const all = await browser.storage.local.get(null);
    const toRemove = Object.keys(all).filter((k) => k.startsWith(PREFIX));
    if (toRemove.length) await browser.storage.local.remove(toRemove);
  } catch {
    /* ignore */
  }
}

export async function invalidate(host: string, endpoint: string): Promise<void> {
  try {
    await browser.storage.local.remove(key(host, endpoint));
  } catch {
    /* ignore */
  }
}
