import { goto, gotoTab, switchToAppById, getInstanceRecord } from '../../../utilities/api';
import { getCommandAction, COMMAND_MODES } from '../../../utilities/configs/commands';
import type { CommandItem, CommandMode } from '../../../types';

interface ActionOptions {
  selectedMenu: CommandItem;
  filter: string;
  commandMode: CommandMode;
  reset: () => void;
  updateCommandMode: (mode: CommandMode) => void;
  updateIsLoading: (loading: boolean) => void;
}

export default async function action({
  selectedMenu,
  filter,
  commandMode,
  reset,
  updateCommandMode,
  updateIsLoading,
}: ActionOptions): Promise<void> {
  try {
    switch (commandMode) {
      case COMMAND_MODES.GO_TO: {
        goto(filter);
        reset();
        break;
      }
      case COMMAND_MODES.FIND_RECORD: {
        if (!filter) return;

        updateIsLoading(true);
        const result = await getInstanceRecord(filter);
        if (result?.target) {
          gotoTab(result.target);
        } else {
          goto(filter);
        }
        reset();
        break;
      }
      case COMMAND_MODES.SWITCH_SCOPE: {
        if (selectedMenu?.key) {
          switchToAppById(selectedMenu.key);
        }
        reset();
        break;
      }
      case COMMAND_MODES.SEARCH_DOC:
      case COMMAND_MODES.SEARCH_COMP: {
        if (!filter) return;

        const commandAction = getCommandAction(commandMode);
        if (commandAction) {
          await commandAction(filter);
        }
        reset();
        break;
      }
      case COMMAND_MODES.ACTIONS: {
        const { action: menuAction, mode: nextMode } = selectedMenu || {};
        if (nextMode) {
          updateCommandMode(nextMode);
        } else if (menuAction) {
          updateIsLoading(true);
          await menuAction();
          reset();
        }
        break;
      }
      case '':
      case COMMAND_MODES.TABLE:
      case COMMAND_MODES.HISTORY: {
        if (selectedMenu?.target) {
          gotoTab(selectedMenu.target);
        }
        reset();
        break;
      }
      default: {
        reset();
      }
    }
  } catch (error) {
    reset();
  } finally {
    updateIsLoading(false);
  }
}
