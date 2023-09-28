import { goto, gotoTab, switchToAppById } from '../../utils/api';
import { getCommandAction, COMMAND_MODES } from '../../configs/commands';
import getInstanceRecord from '../../utils/recordSearch';

/**
 * Executes an action based on the selected menu item and filter input.
 * @async
 * @param {Object} options - An object containing the following properties:
 * @param {Object} options.selectedMenu - The selected menu item.
 * @param {string} options.filter - The filter input.
 * @param {string} options.commandMode - The current command mode.
 * @param {Function} options.reset - A function to dismiss the launcher.
 * @param {Function} options.updateCommandMode - A function to update the command mode.
 * @param {Function} options.updateIsLoading - A function to update the loading state.
 * @returns {void}
 */
export default async function action({
  selectedMenu,
  filter,
  commandMode,
  reset,
  updateCommandMode,
  updateIsLoading,
}) {
  switch (commandMode) {
    case COMMAND_MODES.GO_TO: {
      goto(filter);
      reset();
      break;
    }
    case COMMAND_MODES.FIND_RECORD: {
      if (!filter) return;

      updateIsLoading(true);
      const { target } = await getInstanceRecord(filter);
      target ? gotoTab(target) : goto(filter);
      reset();
      break;
    }
    case COMMAND_MODES.SWITCH_APP: {
      switchToAppById(selectedMenu?.key);
      reset();
      break;
    }
    case COMMAND_MODES.SEARCH_DOC:
    case COMMAND_MODES.SEARCH_COMP: {
      if (!filter) return;

      const commandAction = getCommandAction(commandMode);
      await commandAction(filter);
      reset();
      break;
    }
    case COMMAND_MODES.ACTIONS: {
      const { action, mode: nextMode } = selectedMenu || {};
      if (nextMode) {
        updateCommandMode(nextMode);
      } else if (action) {
        // Immediately executable action
        updateIsLoading(true);
        await action();
        reset();
      }

      break;
    }
    case '':
    case COMMAND_MODES.HISTORY: {
      gotoTab(selectedMenu?.target);
      reset();
      break;
    }
    default: {
      reset();
    }
  }
}
