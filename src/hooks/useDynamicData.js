import React from 'react';
import { fetchHistory } from '../utils/api';
import useLauncherStore from '../store/launcherStore';
import { COMMAND_MODES } from '../configs/commands';

export default function useDynamicData() {
  const updateIsLoading = useLauncherStore((state) => state.updateIsLoading);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const [histories, setHistories] = React.useState([]);

  React.useEffect(() => {
    async function getHistories() {
      const timer = setTimeout(() => {
        updateIsLoading(true);
      }, 150);

      const historyActivities = await fetchHistory();
      setHistories(historyActivities);

      if (timer) {
        clearTimeout(timer);
      }

      updateIsLoading(false);
    }

    if (commandMode !== COMMAND_MODES.HISTORY) return;

    getHistories();
  }, [commandMode, updateIsLoading]);

  return [histories];
}
