import { useCallback, useEffect, useRef, useState } from 'react';
import useLauncherStore from '@store/launcherStore';
import type { CommandItem, CommandMode } from '@/types';

interface UseFetchDemandItemsOptions {
  fetchFn: () => Promise<CommandItem[]>;
  targetMode: CommandMode;
  reuse?: boolean;
}

export default function useFetchDemandItems({ fetchFn, targetMode, reuse = true}: UseFetchDemandItemsOptions): [CommandItem[], () => void] {
  const updateIsLoading = useLauncherStore(state => state.updateIsLoading);
  const commandMode = useLauncherStore(state => state.commandMode);
  const [items, setItems] = useState<CommandItem[]>([]);
  const itemsRef = useRef<CommandItem[]>([]);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  useEffect(() => {
    if (reuse && itemsRef.current.length > 0) {
      setItems(itemsRef.current);
      return;
    }

    async function getItems() {
      try {
        updateIsLoading(true);
        
        const fetchedItems = await fetchFn();
        setItems(fetchedItems);
        itemsRef.current = fetchedItems;
      } finally {
        updateIsLoading(false);
      }
    }

    if (commandMode !== targetMode) return;

    getItems();

    return () => {
      updateIsLoading(false);
    };
  }, [commandMode, updateIsLoading, fetchFn, targetMode, reuse]);

  return [items, clearItems];
} 