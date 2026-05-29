import React from 'react';
import { clearCache, searchDoc, searchComponent, goto, about, openOptions } from '../api/service';
import { showCurrentRecordXml, copyCurrentRecordSysId } from '../api/extractRecord';
import type { CommandMode, CommandModeOrNull, CommandItem } from '@/utils/types';
import { COMMAND_MODES } from './constants';
import {
  ArrowRightLeft,
  Table2,
  TextSearch,
  History,
  Route,
  Files,
  Component,
  GalleryVerticalEnd,
  BadgeInfo,
  FileCode,
  Copy,
  Settings,
} from 'lucide-react';

const commands: CommandItem[] = [
  {
    key: 'cmd:switch_scope',
    fullLabel: 'Switch scope',
    mode: COMMAND_MODES.SWITCH_SCOPE,
    subLabel: 'Switch to application scope',
    placeholderText: 'Type to search...',
    icon: React.createElement(ArrowRightLeft),
  },
  {
    key: 'cmd:table',
    fullLabel: 'Tables',
    mode: COMMAND_MODES.TABLE,
    subLabel: 'Show all tables',
    placeholderText: 'Type to search...',
    icon: React.createElement(Table2),
  },
  {
    key: 'cmd:find_record',
    fullLabel: 'Find record',
    mode: COMMAND_MODES.FIND_RECORD,
    subLabel: 'Find record by sys id',
    placeholderText: 'Type sys id to search...',
    icon: React.createElement(TextSearch),
  },
  {
    key: 'cmd:history',
    fullLabel: 'History',
    mode: COMMAND_MODES.HISTORY,
    subLabel: 'Search history',
    placeholderText: 'Type to search...',
    icon: React.createElement(History),
  },
  {
    key: 'cmd:go_to',
    fullLabel: 'Go to',
    action: goto,
    mode: COMMAND_MODES.GO_TO,
    subLabel: 'Shortcut to {table}.do/{table}.list',
    placeholderText: '{table}.do/{table}.list',
    icon: React.createElement(Route),
  },
  {
    key: 'cmd:search_doc',
    fullLabel: 'Documentation',
    action: searchDoc,
    mode: COMMAND_MODES.SEARCH_DOC,
    subLabel: 'Search development documentation',
    placeholderText: 'Type to search...',
    icon: React.createElement(Files),
  },
  {
    key: 'cmd:search_comp',
    fullLabel: 'Seismic component',
    action: searchComponent,
    mode: COMMAND_MODES.SEARCH_COMP,
    subLabel: 'Search Next Experience seismic components',
    placeholderText: 'Type to search...',
    icon: React.createElement(Component),
  },
  {
    key: 'cmd:actions',
    mode: COMMAND_MODES.ACTIONS,
    fullLabel: 'Actions',
    subLabel: 'Show all actions',
    visible: false,
    placeholderText: 'Type to search...',
  },
  {
    key: 'cmd:show_record_xml',
    action: showCurrentRecordXml,
    fullLabel: 'Show record XML',
    subLabel: "Open the current record's XML in a new tab",
    icon: React.createElement(FileCode),
  },
  {
    key: 'cmd:copy_record_sys_id',
    action: copyCurrentRecordSysId,
    fullLabel: 'Copy record sys_id',
    subLabel: "Copy the current record's sys_id to the clipboard",
    icon: React.createElement(Copy),
  },
  {
    key: 'cmd:clear_cache',
    action: clearCache,
    fullLabel: 'Clear cache',
    subLabel: 'Clear client cache and refresh',
    icon: React.createElement(GalleryVerticalEnd),
  },
  {
    key: 'cmd:settings',
    action: openOptions,
    fullLabel: 'Settings',
    subLabel: 'Open SN Launcher settings',
    icon: React.createElement(Settings),
  },
  {
    key: 'cmd:about',
    action: about,
    fullLabel: 'About',
    subLabel: 'More about this tool',
    icon: React.createElement(BadgeInfo),
  },
];

function findCommandByMode(mode: CommandMode): CommandItem | undefined {
  return commands.find((item) => item.mode === mode);
}

export function getCommandLabelAndPlaceholder(
  mode: CommandModeOrNull
): [label: string, placeholder: string] {
  if (!mode) return ['', 'Type to search...'];
  const command = findCommandByMode(mode);
  return command ? [command.fullLabel, command.placeholderText || ''] : [mode, ''];
}

export function getCommandAction(
  commandMode: CommandMode
): ((...args: any[]) => void) | undefined {
  return findCommandByMode(commandMode)?.action;
}

export default commands;
