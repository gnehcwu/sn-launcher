import React from 'react';
import { fetchOrRetrieveMenu, fetchOrRetrieveApps } from '../utils/api';
import commands from '../configs/commands';
import useLauncherStore from '../store/launcherStore';

export default function useLauncherData() {
  const updateIsLoading = useLauncherStore((state) => state.updateIsLoading);
  const stamp = useLauncherStore((state) => state.stamp);
  const [allMenus, setAllMenus] = React.useState([]);
  const [allScopes, setAllScopes] = React.useState([]);
  const [allCommands, setAllCommands] = React.useState([]);
  // Todo: add support for histories

  React.useEffect(() => {
    async function getLauncherData() {
      const timer = setTimeout(() => {
        updateIsLoading(true);
      }, 150);
      const allMenus = await fetchOrRetrieveMenu();
      const allScopes = await fetchOrRetrieveApps();
      const allCommands = commands;

      setAllMenus(allMenus);
      setAllScopes(allScopes);
      setAllCommands(allCommands);

      // Only update loading status if it takes more 150 to load data
      if (timer) {
        clearTimeout(timer);
      }
      updateIsLoading(false);
    }

    getLauncherData();
  }, [stamp, updateIsLoading]);

  return [allMenus, allScopes, allCommands];
}
