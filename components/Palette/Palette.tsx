import React, { useCallback, useEffect, useMemo } from "react";
import { browser } from "wxt/browser";
import { Route, TextSearch } from "lucide-react";
import type { CommandItem, CommandModeOrNull, LauncherActionValue } from "@/utils/types";
import useLauncherStore from "@/utils/launcherStore";
import usePaletteData from "@/hooks/usePaletteData";
import useHistory from "@/hooks/useHistory";
import useTable from "@/hooks/useTable";
import useScope from "@/hooks/useScope";
import scoreItems from "@/utils/scoring/scoreItems";
import { getCommandLabelAndPlaceholder } from "@/utils/configs/commands";
import { isValidShortcut, isValidSysId } from "@/utils/validation";
import {
  COMMAND_MODES,
  SN_LAUNCHER_ACTIONS,
  SN_LAUNCHER_COMMAND_SHORTCUTS,
} from "@/utils/configs/constants";
import { showCurrentRecordXml } from "@/utils/api/extractRecord";
import action, { SYNTH_GOTO_KEY, SYNTH_FIND_RECORD_KEY } from "./palette-action";
import PaletteShell from "./PaletteShell";
import PaletteHeader from "./PaletteHeader";
import PaletteBody from "./PaletteBody";
import PaletteFooter from "./PaletteFooter";
import "@/assets/tailwind.css";

const DIRECT_ACTION_HANDLERS: Partial<Record<LauncherActionValue, () => void>> = {
  [SN_LAUNCHER_ACTIONS.SHOW_RECORD_XML_COMMAND]: showCurrentRecordXml,
};

function pickSourceList(
  mode: CommandModeOrNull,
  data: {
    menus: CommandItem[];
    commands: CommandItem[];
    scopes: CommandItem[];
    tables: CommandItem[];
    histories: CommandItem[];
  }
): CommandItem[] {
  switch (mode) {
    case COMMAND_MODES.ACTIONS:
      return data.commands;
    case COMMAND_MODES.SWITCH_SCOPE:
      return data.scopes;
    case COMMAND_MODES.TABLE:
      return data.tables;
    case COMMAND_MODES.HISTORY:
      return data.histories;
    case null:
      return data.menus;
    default:
      return [];
  }
}

// Pinned-top items derived from input pattern, so the user gets a goto/find-record
// affordance without the palette layout flipping into compact mode mid-typing.
function getSyntheticItems(filter: string, commandMode: CommandModeOrNull): CommandItem[] {
  if (commandMode != null) return [];
  const trimmed = filter.trim();
  if (!trimmed) return [];
  if (isValidSysId(trimmed)) {
    return [{
      key: SYNTH_FIND_RECORD_KEY,
      fullLabel: `Find record ${trimmed}`,
      label: "Find record",
      subLabel: trimmed,
      icon: React.createElement(TextSearch),
    }];
  }
  if (isValidShortcut(trimmed)) {
    return [{
      key: SYNTH_GOTO_KEY,
      fullLabel: `Go to ${trimmed}`,
      label: "Go to",
      subLabel: trimmed,
      icon: React.createElement(Route),
    }];
  }
  return [];
}

function announce(mode: CommandModeOrNull, count: number): string {
  if (mode == null) return `${count} items`;
  const [label] = getCommandLabelAndPlaceholder(mode);
  return `${label || mode}, ${count} items`;
}

function Palette() {
  const filter = useLauncherStore((s) => s.filter);
  const commandMode = useLauncherStore((s) => s.commandMode);
  const token = useLauncherStore((s) => s.token);
  const selected = useLauncherStore((s) => s.selected);
  const isShown = useLauncherStore((s) => s.isShown);

  const isLoading = useLauncherStore((s) => s.isLoading);
  const error = useLauncherStore((s) => s.error);

  const open = useLauncherStore((s) => s.open);
  const close = useLauncherStore((s) => s.close);
  const enterMode = useLauncherStore((s) => s.enterMode);
  const exitMode = useLauncherStore((s) => s.exitMode);
  const setSelected = useLauncherStore((s) => s.setSelected);
  const setLoading = useLauncherStore((s) => s.setLoading);

  const [menus, commands] = usePaletteData();
  const [tables] = useTable();
  const [histories] = useHistory();
  const [scopes] = useScope();

  const sourceList = useMemo(
    () => pickSourceList(commandMode, { menus, commands, scopes, tables, histories }),
    [commandMode, menus, commands, scopes, tables, histories]
  );

  // Derived synchronously from sourceList/filter/mode so the list never lags
  // a mode switch by a frame — that lag was the source of the header-spinner
  // flash when entering Tables/Scopes (stale list made bodyLoaderVisible
  // briefly false, unsuppressing the spinner before the body skeleton kicked in).
  const currentMenuList = useMemo(() => {
    try {
      return [...getSyntheticItems(filter, commandMode), ...scoreItems(sourceList, filter)];
    } catch {
      return [];
    }
  }, [sourceList, filter, commandMode]);

  const executeAction = useCallback(() => {
    void action({
      selectedMenu: currentMenuList[selected],
      filter,
      commandMode,
      close,
      enterMode,
      setLoading,
    });
  }, [currentMenuList, selected, filter, commandMode, close, enterMode, setLoading]);

  const handleKeydown = useCallback(
    (event: React.KeyboardEvent) => {
      event.stopPropagation();
      const total = currentMenuList?.length ?? 0;
      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown": {
          event.preventDefault();
          if (!total) return;
          const dir = event.key === "ArrowDown" ? 1 : -1;
          setSelected(((selected + dir) % total + total) % total);
          break;
        }
        case "Escape":
          close();
          break;
        case "Enter":
          executeAction();
          break;
        case "Backspace":
          if (!filter && commandMode) {
            exitMode();
          }
          break;
        case "Tab":
          event.preventDefault();
          if (commandMode) {
            exitMode();
          } else {
            enterMode(COMMAND_MODES.ACTIONS);
          }
          break;
      }
    },
    [currentMenuList, selected, filter, commandMode, setSelected, close, executeAction, exitMode, enterMode]
  );

  // Single message listener for all extension shortcuts. Replaces the
  // previous Rules-of-Hooks-violating forEach + useChromeMessage pattern.
  useEffect(() => {
    const handler = (request: { action?: LauncherActionValue }) => {
      const incoming = request?.action;
      if (!incoming) return;

      const shortcut = SN_LAUNCHER_COMMAND_SHORTCUTS[incoming];
      if (!shortcut) return;

      if (shortcut.isDirectAction) {
        DIRECT_ACTION_HANDLERS[incoming]?.();
        return;
      }

      // Toggle palette: if currently shown, close; if hidden, open with optional mode.
      const wasShown = useLauncherStore.getState().isShown;
      if (wasShown) {
        close();
      } else {
        open(shortcut.commandMode);
      }
    };

    browser.runtime.onMessage.addListener(handler);
    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  }, [open, close]);

  const ariaAnnouncement = useMemo(
    () => (isShown ? announce(commandMode, currentMenuList.length) : ""),
    [isShown, commandMode, currentMenuList.length]
  );

  if (!token) return null;

  const activeOptionId = currentMenuList.length ? `snl-row-${selected}` : undefined;
  // Mirrors PaletteBody's skeleton condition so the header spinner can yield
  // to it instead of double-indicating the same loading state.
  const bodyLoaderVisible = !error && isLoading && currentMenuList.length === 0;

  return (
    <PaletteShell
      isShown={isShown}
      onDismiss={close}
      onKeyDown={handleKeydown}
      ariaAnnouncement={ariaAnnouncement}
    >
      <PaletteHeader
        listboxId="snl-listbox"
        activeOptionId={activeOptionId}
        bodyLoaderVisible={bodyLoaderVisible}
      />
      <PaletteBody
        menuList={currentMenuList}
        onAction={executeAction}
      />
      <PaletteFooter
        filteredCount={currentMenuList.length}
        totalCount={sourceList.length}
      />
    </PaletteShell>
  );
}

export default Palette;
