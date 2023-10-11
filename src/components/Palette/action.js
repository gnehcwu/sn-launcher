import { goto, gotoTab, switchToAppById } from '../../utils/api';
import { isValidShortcut, IsValidSysId } from '../../utils/helpers';
import {
  isActionsMode,
  isShortcutMode,
  isFindSysIdMode,
  isCompactMode,
  getCommandAction,
  isHistoryMode,
  isSwitchAppMode,
} from '../../configs/commands';
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
  if (isValidShortcut(filter) || isShortcutMode(commandMode)) {
    goto(filter);
    reset();
  } else if (IsValidSysId(filter) || isFindSysIdMode(commandMode)) {
    updateIsLoading(true);
    const { target } = await getInstanceRecord(filter);
    if (target) {
      gotoTab(target);
    } else {
      goto(filter);
    }
    reset();
  } else if (commandMode && !isActionsMode(commandMode)) {
    if (isSwitchAppMode(commandMode)) {
      switchToAppById(selectedMenu?.key);
    } else if (isHistoryMode(commandMode)) {
      gotoTab(selectedMenu?.target);
    } else {
      if (isCompactMode(commandMode) && !filter.trim()) {
        return;
      }

      const commandAction = getCommandAction(commandMode);
      if (commandAction) {
        await commandAction(filter);
      }
    }
    reset();
  } else {
    const { target, mode: nextCommandMode, action } = selectedMenu || {};

    if (target) {
      gotoTab(target);
      reset();
    } else if (nextCommandMode) {
      updateCommandMode(nextCommandMode);
    } else if (action) {
      updateIsLoading(true);
      action().finally(() => {
        reset();
      });
    }
  }
}
