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

    if (reuse && itemsRef.current.length > 0) {
      setItems(itemsRef.current);
      return;
    }

    let cancelled = false;
    async function getItems() {
      try {
        setLoading(true);
        const fetchedItems = await fetchFn((fresh) => {
          if (cancelled) return;
          setItems(fresh);
          itemsRef.current = fresh;
        });
        if (cancelled) return;
        setItems(fetchedItems);
        itemsRef.current = fetchedItems;
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getItems();

    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [commandMode, setLoading, fetchFn, targetMode, reuse]);

  return [items, clearItems];
}
