import React from "react";
import { Route, TextSearch, UserRoundCog } from "lucide-react";
import type { CommandItem, CommandModeOrNull } from "@/utils/types";
import { isValidShortcut, isValidSysId } from "@/utils/validation";
import { SYNTH_GOTO_KEY, SYNTH_FIND_RECORD_KEY, SYNTH_IMPERSONATE_KEY } from "./palette-action";

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
  if (commandMode != null || !hasSyntheticMatch(filter)) return [];
  const trimmed = filter.trim();
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
