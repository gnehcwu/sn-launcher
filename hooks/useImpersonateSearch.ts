import { useEffect, useState } from 'react';
import { searchUsers } from '@/utils/api';
import useLauncherStore from '@/utils/launcherStore';
import { DEBOUNCE_DELAY } from '@/utils/configs/constants';
import type { CommandItem } from '@/utils/types';

/**
 * Debounced server-side user lookup for Impersonate mode. Only runs while
 * `enabled` (Palette passes true when the typed text matched no loaded user),
 * so the common case stays fully client-side. Drives the store's `isLoading`
 * during the request so the body shows a loader instead of flashing "empty".
 */
export default function useImpersonateSearch(filter: string, enabled: boolean): CommandItem[] {
  const setLoading = useLauncherStore((state) => state.setLoading);
  const [results, setResults] = useState<CommandItem[]>([]);

  useEffect(() => {
    if (!enabled) {
      setResults([]);
      return;
    }

    const query = filter.trim();
    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const found = await searchUsers(query);
        if (!cancelled) setResults(found);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setLoading(false);
    };
  }, [filter, enabled, setLoading]);

  return results;
}
