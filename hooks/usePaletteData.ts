import { useEffect, useState } from 'react';
import { fetchMenus, fetchCommands } from '@/utils/api';
import useLauncherStore from '@/utils/launcherStore';
import type { CommandItem } from '@/utils/types';

export default function usePaletteData(): [
  CommandItem[],
  CommandItem[],
] {
  const updateIsLoading = useLauncherStore((state) => state.updateIsLoading);
  const token = useLauncherStore((state) => state.token);
  const [menus, setMenus] = useState<CommandItem[]>([]);
  const [commands, setCommands] = useState<CommandItem[]>([]);

  useEffect(() => {
    async function getLauncherData() {
      try {
        updateIsLoading(true);

        const [fetchedMenus, fetchedCommands] = await Promise.all([
          fetchMenus(),
          fetchCommands(),
        ]);

        setMenus(fetchedMenus);
        setCommands(fetchedCommands);
      } catch (error) {
        console.error('SN Launcher: failed to fetch launcher data:', error);
      } finally {
        updateIsLoading(false);
      }
    }

    getLauncherData();
  }, [updateIsLoading, token]); // whenever token changes, re-fetch all menus

  return [menus, commands];
}
