import React from 'react';
import { fetchOrRetrieveMenu, fetchOrRetrieveApps } from '../utils/api';
import commands from '../configs/commands';
import useLauncherStore from '../store/launcherStore';

export default function useLauncherData() {
  const [updateIsLoading] = useLauncherStore((state) => [state.updateIsLoading]);
  const [allMenus, setAllMenus] = React.useState([]);
  const [allScopes, setAllScopes] = React.useState([]);
  const [allCommands, setAllCommands] = React.useState([]);
  // Todo: aad support for histories

  React.useEffect(() => {
    async function getLauncherData() {
      updateIsLoading(true);
      const allMenus = await fetchOrRetrieveMenu();
      const allScopes = await fetchOrRetrieveApps();
      const allCommands = commands;

      setAllMenus(allMenus);
      setAllScopes(allScopes);
      setAllCommands(allCommands);
      updateIsLoading(false);
    }

    getLauncherData();
  }, [updateIsLoading]);

  return [allMenus, allScopes, allCommands];
}
