import React from 'react';
import { fetchHistory } from '../utils/api';
import useLauncherStore from '../store/launcherStore';
import { COMMAND_MODES } from '../configs/commands';
import { LOADER_DEFER_TIME } from '../configs/constants';

/**
 * A custom React hook that fetches and returns the user's command history and provides a function to clear it.
 * @returns {[Array, Function]} An array containing the user's command history and a function to clear it.
 */
export default function useHistory() {
  const updateIsLoading = useLauncherStore((state) => state.updateIsLoading);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const [histories, setHistories] = React.useState([]);
  const timerRef = React.useRef();

  /**
   * A function that clears the user's command history.
   */
  const clearHistories = React.useCallback(() => {
    setHistories([]);
  }, []);

  React.useEffect(() => {
    async function getHistories() {
      timerRef.current = setTimeout(() => {
        updateIsLoading(true);
      }, LOADER_DEFER_TIME);

      const historyActivities = await fetchHistory();
      setHistories(historyActivities);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      updateIsLoading(false);
    }

    if (commandMode !== COMMAND_MODES.HISTORY) return;

    getHistories();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [commandMode, updateIsLoading]);

  return [histories, clearHistories];
}
