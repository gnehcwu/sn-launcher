import { goto, gotoTab, switchToAppById } from '../../utils/api';
import { getCommandAction } from '../../configs/commands';
import { isActionsMode, isValidShortcut, IsValidSysId } from '../../utils/helpers';
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
    if (commandMode == 'switch_app') {
      switchToAppById(selectedMenu?.key);
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
