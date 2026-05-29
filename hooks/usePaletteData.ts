import { useEffect, useRef, useState } from 'react';
import { fetchMenus, fetchCommands } from '@/utils/api';
import useLauncherStore from '@/utils/launcherStore';
import type { CommandItem } from '@/utils/types';

export default function usePaletteData(): [
  CommandItem[],
  CommandItem[],
] {
  const setLoading = useLauncherStore((state) => state.setLoading);
  const token = useLauncherStore((state) => state.token);
  const isShown = useLauncherStore((state) => state.isShown);
  const [menus, setMenus] = useState<CommandItem[]>([]);
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const menusRef = useRef<CommandItem[]>([]);

  // Runs on first mount (prefetch so the palette opens instantly) and again
  // every time the palette is opened. The first run shows the loader; every
  // later open revalidates silently in the background (SWR) so a plugin
  // installed mid-session surfaces its nav menus without a tab reload.
  useEffect(() => {
    if (!token) return;
    const hasMenus = menusRef.current.length > 0;
    // Nothing to do while the palette is closed once we've prefetched — don't
    // burn a request on the close transition. The first mount (no data yet)
    // still falls through to prefetch.
    if (!isShown && hasMenus) return;

    let cancelled = false;

    const applyMenus = (fresh: CommandItem[]) => {
      if (cancelled || !fresh.length) return;
      setMenus(fresh);
      menusRef.current = fresh;
    };

    async function getLauncherData() {
      try {
        // Only show the skeleton on the very first fetch. Once menus are on
        // screen, a background refresh must not flash the loader or wipe the
        // list with an empty/failed response.
        if (!hasMenus) setLoading(true);
        const [fetchedMenus, fetchedCommands] = await Promise.all([
          fetchMenus(applyMenus),
          fetchCommands(),
        ]);
        if (cancelled) return;
        if (fetchedMenus.length || !hasMenus) {
          setMenus(fetchedMenus);
          menusRef.current = fetchedMenus;
        }
        setCommands(fetchedCommands);
      } catch (error) {
        console.error('SN Launcher: failed to fetch launcher data:', error);
      } finally {
        if (!cancelled && !hasMenus) setLoading(false);
      }
    }

    getLauncherData();
    return () => {
      cancelled = true;
    };
  }, [setLoading, token, isShown]);

  return [menus, commands];
}
