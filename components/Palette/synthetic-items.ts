import React from "react";
import { Component, Files, Route, TextSearch, UserRoundCog } from "lucide-react";
import type { CommandItem, CommandModeOrNull } from "@/utils/types";
import { COMMAND_MODES } from "@/utils/configs/constants";
import { isValidShortcut, isValidSysId } from "@/utils/validation";
import {
  SYNTH_GOTO_KEY,
  SYNTH_FIND_RECORD_KEY,
  SYNTH_IMPERSONATE_KEY,
  SYNTH_SEARCH_DOC_KEY,
  SYNTH_SEARCH_COMP_KEY,
} from "./palette-action";

// Whether `filter` matches a pattern that produces a pinned synthetic row.
// Single source of truth for both getSyntheticItems (what to render) and
// PaletteHeader (whether to bypass the filter debounce so the row appears
// instantly and a fast Enter doesn't fire against a list without it).
export function hasSyntheticMatch(filter: string): boolean {
  const trimmed = filter.trim();
  return isValidSysId(trimmed) || isValidShortcut(trimmed);
}

// Pinned-top items derived from input pattern, so the user gets a goto/find-record
// affordance without the palette layout flipping into compact mode mid-typing.
export function getSyntheticItems(
  filter: string,
  commandMode: CommandModeOrNull
): CommandItem[] {
  const trimmed = filter.trim();

  // Search modes have no source list — always surface a single row so the user
  // sees what Enter will do, even before typing. The subtitle describes the
  // target (and echoes the query once present). Enter/click route through the
  // SEARCH_DOC / SEARCH_COMP case in palette-action (which keys off the mode).
  if (commandMode === COMMAND_MODES.SEARCH_DOC || commandMode === COMMAND_MODES.SEARCH_COMP) {
    const isDoc = commandMode === COMMAND_MODES.SEARCH_DOC;
    return [
      {
        key: isDoc ? SYNTH_SEARCH_DOC_KEY : SYNTH_SEARCH_COMP_KEY,
        label: isDoc ? "Search documentation" : "Search components",
        subLabel: trimmed
          ? isDoc
            ? `Find “${trimmed}” in the ServiceNow developer docs`
            : `Find “${trimmed}” in Next Experience components`
          : isDoc
            ? "Search the ServiceNow developer docs"
            : "Search Next Experience (Seismic) components",
        fullLabel: isDoc ? `Search documentation ${trimmed}` : `Search components ${trimmed}`,
        icon: React.createElement(isDoc ? Files : Component),
      },
    ];
  }

  // Find record / Go to modes likewise have no source list — always show their
  // affordance row. Enter/click route through the matching case in palette-action.
  if (commandMode === COMMAND_MODES.FIND_RECORD) {
    return [
      {
        key: SYNTH_FIND_RECORD_KEY,
        label: "Find record",
        subLabel: trimmed ? `Open the record “${trimmed}”` : "Open a record by its sys_id",
        fullLabel: `Find record ${trimmed}`,
        icon: React.createElement(TextSearch),
      },
    ];
  }
  if (commandMode === COMMAND_MODES.GO_TO) {
    return [
      {
        key: SYNTH_GOTO_KEY,
        label: "Go to",
        subLabel: trimmed ? `Open “${trimmed}”` : "Jump to any .do or .list page",
        fullLabel: `Go to ${trimmed}`,
        icon: React.createElement(Route),
      },
    ];
  }

  if (commandMode != null || !hasSyntheticMatch(filter)) return [];
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

// Impersonate-by-sys_id escape hatch. Only offered when the typed text is a
// valid sys_id — the one case where the raw input is an unambiguous identifier,
// so impersonating it directly is correct (no server lookup needed). Name text
// goes through searchUsers instead. Enter routes through palette-action's
// SYNTH_IMPERSONATE_KEY branch.
export function getImpersonateSysIdItem(sysId: string): CommandItem {
  return {
    key: SYNTH_IMPERSONATE_KEY,
    fullLabel: `Impersonate ${sysId}`,
    label: "Impersonate",
    subLabel: `Impersonate user by sys_id ${sysId}`,
    icon: React.createElement(UserRoundCog),
  };
}
