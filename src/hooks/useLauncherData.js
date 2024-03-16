import React from 'react';
import { fetchMenus, fetchApps, fetchAllTables } from '../utils/api';
import commands from '../configs/commands';
import useLauncherStore from '../store/launcherStore';

/**
 * A custom React hook that fetches and stores launcher data.
 * @returns {Array} An array containing allMenus, allScopes, and allCommands.
 */
export default function useLauncherData() {
  const updateIsLoading = useLauncherStore((state) => state.updateIsLoading);
  const updateInitialDataLoaded = useLauncherStore((state) => state.updateInitialDataLoaded);
  const [allMenus, setAllMenus] = React.useState([]);
  const [allScopes, setAllScopes] = React.useState([]);
  const [allCommands, setAllCommands] = React.useState([]);
  const [allTables, setAllTables] = React.useState([]);

  React.useEffect(() => {
    async function getLauncherData() {
      updateIsLoading(true);

      const [allMenus, allApps, allCommands, allTables] = await Promise.all([
        fetchMenus(),
        fetchApps(),
        Promise.resolve(commands.filter((command) => command.visible !== false)),
        fetchAllTables(),
      ]);

      setAllMenus(allMenus);
      setAllScopes(allApps);
      setAllCommands(allCommands);
      setAllTables(allTables);

      updateIsLoading(false);
      updateInitialDataLoaded(true);
    }

    getLauncherData();
  }, [updateInitialDataLoaded, updateIsLoading]);

  return [allMenus, allScopes, allCommands, allTables];
}
