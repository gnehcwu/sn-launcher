import { useCallback, useEffect, useRef, useState } from 'react';
import useLauncherStore from '@/utils/launcherStore';
import type { CommandItem, CommandMode } from '@/utils/types';

interface UseFetchDemandItemsOptions {
  fetchFn: (onRevalidate?: (fresh: CommandItem[]) => void) => Promise<CommandItem[]>;
  targetMode: CommandMode;
  reuse?: boolean;
}

export default function useFetchDemandItems({
  fetchFn,
  targetMode,
  reuse = true,
}: UseFetchDemandItemsOptions): [CommandItem[], () => void] {
  const setLoading = useLauncherStore((state) => state.setLoading);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const [items, setItems] = useState<CommandItem[]>([]);
  const itemsRef = useRef<CommandItem[]>([]);

  const clearItems = useCallback(() => {
    setItems([]);
    itemsRef.current = [];
  }, []);

  useEffect(() => {
    if (commandMode !== targetMode) return;

    let cancelled = false;
    // Whether we already have an in-memory copy to show immediately.
    const hasCached = reuse && itemsRef.current.length > 0;

    const applyFresh = (fresh: CommandItem[]) => {
      if (cancelled) return;
      setItems(fresh);
      itemsRef.current = fresh;
    };

    // Snappy open: paint the cached list instantly. First time through (or when
    // reuse is off) there's nothing to show yet, so surface the loading state.
    if (hasCached) {
      setItems(itemsRef.current);
    } else {
      setLoading(true);
    }

    // Always revalidate in the background (SWR), even when serving a cached
    // copy — so server-side changes (e.g. a newly installed plugin's tables)
    // appear on the next open with no manual reload or cache clear. When a
    // cached list is already on screen we keep the loader off (no skeleton
    // flash) and never replace it with an empty result, so a transient/failed
    // fetch can't wipe good data.
    (async () => {
      try {
        const fetched = await fetchFn(applyFresh);
        if (!cancelled && (fetched.length || !hasCached)) {
          applyFresh(fetched);
        }
      } catch {
        /* keep showing whatever we already have */
      } finally {
        if (!cancelled && !hasCached) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (!hasCached) setLoading(false);
    };
  }, [commandMode, setLoading, fetchFn, targetMode, reuse]);

  return [items, clearItems];
}
