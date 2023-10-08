import { goto, gotoTab, switchToAppById } from '../../utils/api';
import { getCommandAction } from '../../configs/commands';
import { isValidShortcut, IsValidSysId } from '../../utils/helpers';
import { isActionsMode, COMMAND_MODES } from '../../configs/commands';
import getInstanceRecord from '../../utils/recordSearch';

export default async function action({
  selectedMenu,
  filter,
  updateFilter,
  commandMode,
  dismissLauncher,
  updateCommandMode,
  updateIsLoading,
  updateStamp,
}) {
  if (isValidShortcut(filter)) {
    goto(filter);
    dismissLauncher();
  } else if (IsValidSysId(filter)) {
    updateIsLoading(true);
    const { target } = await getInstanceRecord(filter);
    if (target) {
      gotoTab(target);
      dismissLauncher();
    } else {
      updateIsLoading(false);
    }
  } else if (commandMode && !isActionsMode(commandMode)) {
    if (commandMode === COMMAND_MODES.SWITCH_APP) {
      switchToAppById(selectedMenu?.key);
    } else if (commandMode === COMMAND_MODES.HISTORY) {
      const { target } = selectedMenu;
      gotoTab(target);
    } else {
      const commandAction = getCommandAction(commandMode);
      if (commandAction) {
        await commandAction(filter);
      }
    }
    dismissLauncher();
  } else {
    const { target, mode: nextCommandMode, action } = selectedMenu;

    if (target) {
      gotoTab(target);
      dismissLauncher();
    } else if (nextCommandMode) {
      updateCommandMode(nextCommandMode);
    } else if (action) {
      updateIsLoading(true);
      action().finally(() => {
        updateIsLoading(false);
        updateFilter('');
        updateCommandMode('');
        updateStamp();
      });
    }
  }
}
