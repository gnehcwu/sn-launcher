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
  const hit = await read<T>(key(host, endpoint));
  if (!hit) return null;
  if (Date.now() - hit.t >= ttlMs) return null;
  return hit.v;
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
