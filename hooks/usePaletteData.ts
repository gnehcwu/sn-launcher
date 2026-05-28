import { useEffect, useState } from 'react';
import { fetchMenus, fetchCommands } from '@/utils/api';
import useLauncherStore from '@/utils/launcherStore';
import type { CommandItem } from '@/utils/types';

export default function usePaletteData(): [
  CommandItem[],
  CommandItem[],
] {
  const setLoading = useLauncherStore((state) => state.setLoading);
  const token = useLauncherStore((state) => state.token);
  const [menus, setMenus] = useState<CommandItem[]>([]);
  const [commands, setCommands] = useState<CommandItem[]>([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function getLauncherData() {
      try {
        setLoading(true);
        const [fetchedMenus, fetchedCommands] = await Promise.all([
          fetchMenus((fresh) => {
            if (cancelled) return;
            setMenus(fresh);
          }),
          fetchCommands(),
        ]);
        if (cancelled) return;
        setMenus(fetchedMenus);
        setCommands(fetchedCommands);
      } catch (error) {
        console.error('SN Launcher: failed to fetch launcher data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getLauncherData();
    return () => {
      cancelled = true;
    };
  }, [setLoading, token]);

  return [menus, commands];
}
