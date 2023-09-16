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
  // Add shown as a dependency to shown the latest data, isLoading might be the better option

  return [allMenus, allScopes, allCommands];
}
