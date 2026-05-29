import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { browser } from "wxt/browser";
import type { CommandItem, CommandModeOrNull, LauncherActionValue } from "@/utils/types";
import useLauncherStore from "@/utils/launcherStore";
import usePaletteData from "@/hooks/usePaletteData";
import useHistory from "@/hooks/useHistory";
import useTable from "@/hooks/useTable";
import useScope from "@/hooks/useScope";
import useUser from "@/hooks/useUser";
import useUpdateSet from "@/hooks/useUpdateSet";
import useImpersonateSearch from "@/hooks/useImpersonateSearch";
import scoreItems from "@/utils/scoring/scoreItems";
import { getCommandLabelAndPlaceholder } from "@/utils/configs/commands";
import { isValidSysId } from "@/utils/validation";
import {
  COMMAND_MODES,
  MIN_MATCH_LENGTH,
  IMPERSONATE_LOCAL_MATCH_THRESHOLD,
  SN_LAUNCHER_ACTIONS,
  SN_LAUNCHER_COMMAND_SHORTCUTS,
} from "@/utils/configs/constants";
import { showCurrentRecordXml } from "@/utils/api/extractRecord";
import action from "./palette-action";
import { getSyntheticItems, getImpersonateSysIdItem } from "./synthetic-items";
import PaletteShell from "./PaletteShell";
import PaletteHeader from "./PaletteHeader";
import PaletteBody from "./PaletteBody";
import PaletteFooter from "./PaletteFooter";
import ActionPanel from "./ActionPanel";
import { getSubActions, type SubAction } from "./sub-actions";
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
    users: CommandItem[];
    updateSets: CommandItem[];
  }
): CommandItem[] {
  switch (mode) {
    case COMMAND_MODES.ACTIONS:
      return data.commands;
    case COMMAND_MODES.SWITCH_SCOPE:
      return data.scopes;
    case COMMAND_MODES.SWITCH_UPDATE_SET:
      return data.updateSets;
    case COMMAND_MODES.TABLE:
      return data.tables;
    case COMMAND_MODES.HISTORY:
      return data.histories;
    case COMMAND_MODES.IMPERSONATE:
      return data.users;
    case null:
      return data.menus;
    default:
      return [];
  }
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
  const [users] = useUser();
  const [updateSets] = useUpdateSet();

  const sourceList = useMemo(
    () =>
      pickSourceList(commandMode, {
        menus,
        commands,
        scopes,
        tables,
        histories,
        users,
        updateSets,
      }),
    [commandMode, menus, commands, scopes, tables, histories, users, updateSets]
  );

  // Derived synchronously from sourceList/filter/mode so the list never lags
  // a mode switch by a frame — that lag was the source of the header-spinner
  // flash when entering Tables/Scopes (stale list made bodyLoaderVisible
  // briefly false, unsuppressing the spinner before the body skeleton kicked in).
  // Local matches over the in-memory source list (cheap; runs every render).
  // Impersonate applies a quality floor so loose subsequence junk doesn't mask the
  // need for a server lookup; every other mode keeps the permissive fuzzy match.
  const localScored = useMemo(() => {
    try {
      const minScore =
        commandMode === COMMAND_MODES.IMPERSONATE ? IMPERSONATE_LOCAL_MATCH_THRESHOLD : 0;
      return scoreItems(sourceList, filter, minScore);
    } catch {
      return [];
    }
  }, [sourceList, filter, commandMode]);

  // Impersonate fallback: hit the server only when no loaded user matches (after
  // the quality floor above), the query is long enough, and it isn't already a
  // sys_id (which impersonates directly, no lookup needed).
  const trimmedFilter = filter.trim();
  const needsUserSearch =
    commandMode === COMMAND_MODES.IMPERSONATE &&
    trimmedFilter.length >= MIN_MATCH_LENGTH &&
    localScored.length === 0 &&
    !isValidSysId(trimmedFilter);
  const userSearchResults = useImpersonateSearch(filter, needsUserSearch);

  const currentMenuList = useMemo(() => {
    if (commandMode === COMMAND_MODES.IMPERSONATE) {
      // Short query (full list) or a real local match → show the loaded list.
      if (trimmedFilter.length < MIN_MATCH_LENGTH || localScored.length > 0) return localScored;
      // Otherwise: a typed sys_id impersonates directly; any other text is
      // resolved to real users via the server lookup.
      if (isValidSysId(trimmedFilter)) return [getImpersonateSysIdItem(trimmedFilter)];
      return userSearchResults;
    }
    return [...getSyntheticItems(filter, commandMode), ...localScored];
  }, [commandMode, filter, trimmedFilter, localScored, userSearchResults]);

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

  // Action panel (⌘K) — secondary actions for the currently selected item.
  const [actionPanelOpen, setActionPanelOpen] = useState(false);
  const [actionPanelSelected, setActionPanelSelected] = useState(0);
  // Which action row is currently displaying its `feedback` ("Copied" etc).
  // Null when nothing is in flight.
  const [actionFeedbackKey, setActionFeedbackKey] = useState<string | null>(null);
  // Which action row is in its programmatic "pressed" beat — the brief
  // acknowledgment that fires on both Enter and click. Needed because the
  // CSS :active pseudo only fires for mouse/Space, leaving keyboard Enter
  // with no visual press signal.
  const [actionPressedKey, setActionPressedKey] = useState<string | null>(null);
  // Tracks the close-after-feedback timer so a second click / Escape / context
  // change can cancel a still-pending close.
  const feedbackTimerRef = useRef<number | null>(null);
  const pressTimerRef = useRef<number | null>(null);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current != null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const clearPressTimer = useCallback(() => {
    if (pressTimerRef.current != null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const selectedItem = currentMenuList[selected];
  const subActions = useMemo(
    () => getSubActions(selectedItem, commandMode, { close }),
    [selectedItem, commandMode, close]
  );

  // Close the panel and reset its cursor whenever the underlying context shifts
  // (filter change, mode change, mouse-hover selection change). The panel only
  // makes sense against a stable snapshot of the selected item.
  useEffect(() => {
    setActionPanelOpen(false);
    setActionPanelSelected(0);
    setActionFeedbackKey(null);
    setActionPressedKey(null);
    clearFeedbackTimer();
    clearPressTimer();
  }, [selected, filter, commandMode, clearFeedbackTimer, clearPressTimer]);

  // Belt-and-braces: cancel any pending timer on unmount so stale callbacks
  // can't fire against a disposed component.
  useEffect(
    () => () => {
      clearFeedbackTimer();
      clearPressTimer();
    },
    [clearFeedbackTimer, clearPressTimer]
  );

  const runSubAction = useCallback(
    (sub: SubAction) => {
      // A new click interrupts any pending feedback close — last write wins.
      clearFeedbackTimer();
      clearPressTimer();

      // Press flash: brief scale + bg dim on the row, acknowledging the
      // activation. CSS :active doesn't fire for keyboard Enter, so the
      // programmatic state is what gives keyboard users a press signal.
      setActionPressedKey(sub.key);

      if (sub.feedback) {
        // Copy actions fire immediately — clipboard write shouldn't wait
        // on the press beat. The feedback container takes over as the
        // dominant visual; 100ms press flash just bridges the 0-100ms gap
        // before the check container is clearly emerging.
        void sub.run();
        setActionFeedbackKey(sub.key);
        pressTimerRef.current = window.setTimeout(() => {
          pressTimerRef.current = null;
          setActionPressedKey(null);
        }, 100);
        // 820ms total — two clean beats plus a hold:
        //   0-220ms   container scales + fades in
        //   240-620ms stroke draws (natural pen direction: tail → arm)
        //   620-820ms 200ms stable hold for the eye to register the drawn check
        feedbackTimerRef.current = window.setTimeout(() => {
          feedbackTimerRef.current = null;
          setActionFeedbackKey(null);
          setActionPanelOpen(false);
          // Mirror the implicit close that non-feedback actions perform inside
          // their own run() callbacks.
          close();
        }, 820);
      } else {
        // Open actions: hold the press for 150ms (Emil's instant-feedback
        // band) before firing. Without this, the panel unmounts in the same
        // frame and the press class never paints — keyboard Enter would
        // feel like a no-op.
        pressTimerRef.current = window.setTimeout(() => {
          pressTimerRef.current = null;
          setActionPressedKey(null);
          void sub.run();
          setActionPanelOpen(false);
        }, 150);
      }
    },
    [clearFeedbackTimer, clearPressTimer, close]
  );

  const handleKeydown = useCallback(
    (event: React.KeyboardEvent) => {
      event.stopPropagation();

      // ⌘K / Ctrl+K: toggle action panel for the selected item (if any actions).
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (actionPanelOpen) {
          setActionPanelOpen(false);
        } else if (subActions.length > 0) {
          setActionPanelOpen(true);
        }
        return;
      }

      // While the action panel is open, route nav keys to it instead of the main list.
      if (actionPanelOpen) {
        const subTotal = subActions.length;
        switch (event.key) {
          case "ArrowUp":
          case "ArrowDown":
          case "Tab": {
            // Tab/Shift+Tab cycle through sub-actions instead of moving
            // focus out of the panel — focus is locked here while open.
            event.preventDefault();
            if (!subTotal) return;
            const dir =
              event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)
                ? 1
                : -1;
            setActionPanelSelected(((actionPanelSelected + dir) % subTotal + subTotal) % subTotal);
            return;
          }
          case "Enter": {
            event.preventDefault();
            const sub = subActions[actionPanelSelected];
            if (sub) runSubAction(sub);
            return;
          }
          case "Escape": {
            event.preventDefault();
            setActionPanelOpen(false);
            return;
          }
        }
        // Swallow other keys so the filter input doesn't change underneath.
        return;
      }

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
    [
      currentMenuList,
      selected,
      filter,
      commandMode,
      setSelected,
      close,
      executeAction,
      exitMode,
      enterMode,
      actionPanelOpen,
      actionPanelSelected,
      subActions,
      runSubAction,
    ]
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
        actionPanelOpen={actionPanelOpen}
      />
      <PaletteBody
        menuList={currentMenuList}
        onAction={executeAction}
      />
      <PaletteFooter
        filteredCount={currentMenuList.length}
        totalCount={sourceList.length}
        actionsAvailable={subActions.length > 0}
      />
      {actionPanelOpen && subActions.length > 0 && selectedItem && (
        <ActionPanel
          itemLabel={selectedItem.label || selectedItem.fullLabel}
          actions={subActions}
          selected={actionPanelSelected}
          feedbackKey={actionFeedbackKey}
          pressedKey={actionPressedKey}
          onSelect={setActionPanelSelected}
          onRun={runSubAction}
          onDismiss={() => setActionPanelOpen(false)}
        />
      )}
    </PaletteShell>
  );
}

export default Palette;
