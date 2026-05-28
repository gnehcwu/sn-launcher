import React from "react";
import { ArrowUpRight, ArrowRightLeft, FileCode, History, Link, Table2 } from "lucide-react";
import { copyLink, gotoTab, switchToAppById } from "@/utils/api";
import { COMMAND_MODES } from "@/utils/configs/constants";
import type { CommandItem, CommandModeOrNull } from "@/utils/types";
import { SYNTH_FIND_RECORD_KEY, SYNTH_GOTO_KEY } from "./palette-action";

// Definition segment is reused for both "open" and "copy link" variants.
const tableDefinitionSegment = (sysId: string) => `sys_db_object.do?sys_id=${sysId}`;

// Marker that ActionPanel should render its success confirmation for this
// action (animated check + announced label). The icon is owned by the
// renderer — all copy actions confirm the same way.
const COPIED_FEEDBACK = { label: "Copied" };

export interface SubAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  run: () => void | Promise<void>;
  // When set, ActionPanel briefly shows its success confirmation (an
  // animated check that draws itself in) in the row's right slot before
  // the panel closes. `label` is what gets announced to screen readers.
  // Used for actions that complete silently (clipboard writes) where the
  // user otherwise has no signal of success.
  feedback?: { label: string };
}

interface SubActionCtx {
  close: () => void;
}

export function getSubActions(
  item: CommandItem | undefined,
  mode: CommandModeOrNull,
  ctx: SubActionCtx
): SubAction[] {
  if (!item) return [];
  // Synth items (goto / find record) execute the user's typed input directly;
  // no per-item alternates make sense for them yet.
  if (item.key === SYNTH_GOTO_KEY || item.key === SYNTH_FIND_RECORD_KEY) return [];

  switch (mode) {
    case COMMAND_MODES.TABLE: {
      const actions: SubAction[] = [];
      if (item.target) {
        actions.push({
          key: "table:open-list",
          label: "Open list view",
          icon: <Table2 size={16} />,
          run: () => {
            gotoTab(item.target!);
            ctx.close();
          },
        });
      }
      if (item.sysId) {
        const defSegment = tableDefinitionSegment(item.sysId);
        actions.push({
          key: "table:open-definition",
          label: "Open table schema",
          icon: <FileCode size={16} />,
          run: () => {
            gotoTab(defSegment);
            ctx.close();
          },
        });
      }
      if (item.target) {
        actions.push({
          key: "table:copy-list-link",
          label: "Copy list view link",
          icon: <Link size={16} />,
          feedback: COPIED_FEEDBACK,
          // No ctx.close() — orchestrator closes after the feedback delay.
          run: () => copyLink(item.target!),
        });
      }
      if (item.sysId) {
        const defSegment = tableDefinitionSegment(item.sysId);
        actions.push({
          key: "table:copy-definition-link",
          label: "Copy schema link",
          icon: <Link size={16} />,
          feedback: COPIED_FEEDBACK,
          run: () => copyLink(defSegment),
        });
      }
      return actions;
    }
    case COMMAND_MODES.SWITCH_SCOPE: {
      return [
        {
          key: "scope:switch",
          label: "Switch to scope",
          icon: <ArrowRightLeft size={16} />,
          run: () => {
            void switchToAppById(item.key);
            ctx.close();
          },
        },
      ];
    }
    case COMMAND_MODES.HISTORY: {
      if (!item.target) return [];
      return [
        {
          key: "history:open",
          label: "Open history",
          icon: <History size={16} />,
          run: () => {
            gotoTab(item.target!);
            ctx.close();
          },
        },
        {
          key: "history:copy-link",
          label: "Copy link",
          icon: <Link size={16} />,
          feedback: COPIED_FEEDBACK,
          run: () => copyLink(item.target!),
        },
      ];
    }
    case null: {
      if (!item.target) return [];
      return [
        {
          key: "menu:open",
          label: "Open menu",
          icon: <ArrowUpRight size={16} />,
          run: () => {
            gotoTab(item.target!);
            ctx.close();
          },
        },
        {
          key: "menu:copy-link",
          label: "Copy link",
          icon: <Link size={16} />,
          feedback: COPIED_FEEDBACK,
          run: () => copyLink(item.target!),
        },
      ];
    }
    default:
      return [];
  }
}
