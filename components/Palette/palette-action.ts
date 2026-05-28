import { goto, gotoTab, switchToAppById, getInstanceRecord } from '@/utils/api';
import { getCommandAction } from '@/utils/configs/commands';
import { COMMAND_MODES } from '@/utils/configs/constants';
import type { CommandItem, CommandModeOrNull, CommandMode } from '@/utils/types';

export const SYNTH_GOTO_KEY = 'synth:goto';
export const SYNTH_FIND_RECORD_KEY = 'synth:find_record';

async function findRecord(filter: string, setLoading: (loading: boolean) => void): Promise<void> {
  setLoading(true);
  const result = await getInstanceRecord(filter);
  if (result?.target) {
    gotoTab(result.target);
  } else {
    goto(filter);
  }
}

interface ActionOptions {
  selectedMenu: CommandItem | undefined;
  filter: string;
  commandMode: CommandModeOrNull;
  close: () => void;
  enterMode: (mode: CommandMode) => void;
  setLoading: (loading: boolean) => void;
}

export default async function action({
  selectedMenu,
  filter,
  commandMode,
  close,
  enterMode,
  setLoading,
}: ActionOptions): Promise<void> {
  try {
    switch (commandMode) {
      case COMMAND_MODES.GO_TO: {
        goto(filter);
        close();
        break;
      }
      case COMMAND_MODES.FIND_RECORD: {
        if (!filter) return;
        await findRecord(filter, setLoading);
        close();
        break;
      }
      case COMMAND_MODES.SWITCH_SCOPE: {
        if (selectedMenu?.key) {
          switchToAppById(selectedMenu.key);
        }
        close();
        break;
      }
      case COMMAND_MODES.SEARCH_DOC:
      case COMMAND_MODES.SEARCH_COMP: {
        if (!filter) return;
        const commandAction = getCommandAction(commandMode);
        if (commandAction) {
          await commandAction(filter);
        }
        close();
        break;
      }
      case COMMAND_MODES.ACTIONS: {
        const nextMode = selectedMenu?.mode;
        const menuAction = selectedMenu?.action;
        if (nextMode) {
          enterMode(nextMode);
        } else if (menuAction) {
          setLoading(true);
          await menuAction();
          close();
        }
        break;
      }
      case null: {
        if (selectedMenu?.key === SYNTH_GOTO_KEY) {
          goto(filter);
          close();
          break;
        }
        if (selectedMenu?.key === SYNTH_FIND_RECORD_KEY) {
          if (!filter) return;
          await findRecord(filter, setLoading);
          close();
          break;
        }
        if (selectedMenu?.target) {
          gotoTab(selectedMenu.target);
        }
        close();
        break;
      }
      case COMMAND_MODES.TABLE:
      case COMMAND_MODES.HISTORY: {
        if (selectedMenu?.target) {
          gotoTab(selectedMenu.target);
        }
        close();
        break;
      }
      default: {
        close();
      }
    }
  } catch (error) {
    console.error('SN Launcher: action error:', error);
    close();
  } finally {
    setLoading(false);
  }
}
