import React from 'react';
import { clearCache, searchDoc, searchComponent, goto } from '../api/service';
import type { CommandMode, CommandItem } from '../../types';
import { COMMAND_MODES } from './constants';
import { ArrowRightLeft, Table2, TextSearch, History, Route, Files, Component, GalleryVerticalEnd} from 'lucide-react';

const commands: CommandItem[] = [
  {
    key: crypto.randomUUID(),
    fullLabel: 'Switch scope',
    mode: COMMAND_MODES.SWITCH_SCOPE,
    subLabel: 'Switch to application scope',
    placeholderText: 'Type to search...',
    icon: React.createElement(ArrowRightLeft),
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Tables',
    mode: COMMAND_MODES.TABLE,
    subLabel: 'Show all tables',
    placeholderText: 'Type to search...',
    icon: React.createElement(Table2),
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Find record',
    mode: COMMAND_MODES.FIND_RECORD,
    subLabel: 'Find record by sys id',
    placeholderText: 'Type sys id to search...',
    icon: React.createElement(TextSearch),
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'History',
    mode: COMMAND_MODES.HISTORY,
    subLabel: 'Search history',
    placeholderText: 'Type to search...',
    icon: React.createElement(History),
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Go to',
    action: goto,
    mode: COMMAND_MODES.GO_TO,
    subLabel: 'Shortcut to {table}.do / {table}.list',
    placeholderText: '{table}.do / {table}.list',
    icon: React.createElement(Route),
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Search documentation',
    action: searchDoc,
    mode: COMMAND_MODES.SEARCH_DOC,
    subLabel: 'Search development documentation',
    placeholderText: 'Type to search...',
    icon: React.createElement(Files),
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Search seismic component',
    action: searchComponent,
    mode: COMMAND_MODES.SEARCH_COMP,
    subLabel: 'Search Next Experience seismic components',
    placeholderText: 'Type to search...',
    icon: React.createElement(Component),
  },
  {
    key: crypto.randomUUID(),
    mode: COMMAND_MODES.ACTIONS,
    fullLabel: 'Actions',
    subLabel: 'Show all actions',
    visible: false,
    placeholderText: 'Type to search...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Clear cache',
    action: clearCache,
    subLabel: 'Clear client cache and refresh',
    icon: React.createElement(GalleryVerticalEnd),
  },
];

/**
 * Finds a command object in the `commands` array that matches the given `mode`.
 * @param {CommandMode} mode - The mode to search for.
 * @returns {Command | undefined} - The command object that matches the given `mode`, or `undefined` if no match is found.
 */
function findCommandByMode(mode: CommandMode): CommandItem | undefined {
  return commands.find((item) => item.mode === mode);
}

/**
 * Returns an array containing the full label and placeholder text for a given mode.
 * @param {CommandMode} mode - The mode to find the command for.
 * @returns {[string, string] | CommandMode} - An array containing the full label and placeholder text if a command is found, otherwise the mode string.
 */
export function getCommandLabelAndPlaceholder(mode: CommandMode): [string, string] | CommandMode {
  const command = findCommandByMode(mode);
  return command ? [command.fullLabel, command.placeholderText || ''] : mode;
}

/**
 * Returns the action associated with the given command mode.
 * @param {CommandMode} commandMode - The mode of the command.
 * @returns {(() => void) | undefined} - The action associated with the command mode.
 */
export function getCommandAction(commandMode: CommandMode): ((...args: any[]) => void) | undefined {
  const command = findCommandByMode(commandMode);
  return command?.action;
}

/**
 * Checks if the given command mode is a compact mode.
 * Compact modes are specific command types that use a condensed UI layout.
 * @param {CommandMode} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is a compact mode and the mode is not empty.
 */
export function isCompactLayoutMode(commandMode: CommandMode): boolean {
  const compactModes = new Set([
    COMMAND_MODES.FIND_RECORD,
    COMMAND_MODES.GO_TO,
    COMMAND_MODES.SEARCH_DOC,
    COMMAND_MODES.SEARCH_COMP,
  ]);
  return Boolean(commandMode) && compactModes.has(commandMode as COMMAND_MODES);
}

/**
 * Checks if the given command mode is an extended mode.
 * Extended modes are command types that use an expanded UI layout with additional features.
 * @param {CommandMode} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is an extended mode and the mode is not empty.
 */
export function isFullLayoutMode(commandMode: CommandMode): boolean {
  return (
    Boolean(commandMode) &&
    (isActionsMode(commandMode) ||
      isSwitchScopeMode(commandMode) ||
      isTableMode(commandMode) ||
      isHistoryMode(commandMode))
  );
}

/**
 * Generic function to check command mode
 * @param {CommandMode} commandMode - The command mode to check
 * @param {COMMAND_MODES} targetMode - The mode to compare against
 * @returns {boolean} - True if the command mode matches the target mode
 */
function isMode(commandMode: CommandMode, targetMode: COMMAND_MODES): boolean {
  return commandMode === targetMode;
}

/**
 * Checks if the given command mode is in actions mode.
 * @param {CommandMode} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is in actions mode, false otherwise.
 */
export const isActionsMode = (commandMode: CommandMode): boolean =>
  isMode(commandMode, COMMAND_MODES.ACTIONS);

/**
 * Checks if the given command mode is for switching the app.
 * @param {CommandMode} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is for switching the app, false otherwise.
 */
export const isSwitchScopeMode = (commandMode: CommandMode): boolean =>
  isMode(commandMode, COMMAND_MODES.SWITCH_SCOPE);

/**
 * Checks if the given command mode is table mode.
 * @param {CommandMode} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is table mode, false otherwise.
 */
export const isTableMode = (commandMode: CommandMode): boolean =>
  isMode(commandMode, COMMAND_MODES.TABLE);

/**
 * Checks if the given command mode is history mode.
 * @param {CommandMode} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is history mode, false otherwise.
 */
export const isHistoryMode = (commandMode: CommandMode): boolean =>
  isMode(commandMode, COMMAND_MODES.HISTORY);

/**
 * Checks if the given command mode is in "find record" mode.
 * @param {CommandMode} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is in "find record" mode, false otherwise.
 */
export const isFindSysIdMode = (commandMode: CommandMode): boolean =>
  isMode(commandMode, COMMAND_MODES.FIND_RECORD);

/**
 * Checks if the command mode is shortcut mode.
 * @param {CommandMode} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is shortcut mode, false otherwise.
 */
export const isShortcutMode = (commandMode: CommandMode): boolean =>
  isMode(commandMode, COMMAND_MODES.GO_TO);

export default commands;
