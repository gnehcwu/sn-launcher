import { goto, gotoTab, switchToAppById } from './api';
import { getCommandAction } from '../configs/commands';
import { isValidShortcut } from '../utils/helpers';

export default async function action({
  selectedMenu,
  filter,
  updateFilter,
  commandMode,
  dismissLauncher,
  updateCommandMode,
  updateIsLoading,
}) {
  if (isValidShortcut(filter)) {
    goto(filter);
    dismissLauncher();
  } else if (commandMode) {
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
      });
    }
  }
}
