import React from "react";
import { Route, TextSearch } from "lucide-react";
import type { CommandItem, CommandModeOrNull } from "@/utils/types";
import { isValidShortcut, isValidSysId } from "@/utils/validation";
import { SYNTH_GOTO_KEY, SYNTH_FIND_RECORD_KEY } from "./palette-action";

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
