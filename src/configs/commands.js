import { refreshApps, clearCache, searchDoc, searchComponent, goto } from '../utils/api';

export const COMMAND_MODES = {
  FIND_RECORD: 'find_record',
  SEARCH_DOC: 'search_doc',
  SEARCH_COMP: 'search_comp',
  SWITCH_APP: 'switch_app',
  GO_TO: 'go_to',
  ACTIONS: 'actions',
  HISTORY: 'history',
};

const commands = [
  {
    key: crypto.randomUUID(),
    fullLabel: 'Record',
    mode: COMMAND_MODES.FIND_RECORD,
    description: 'Find record by sys id',
    placeholderText: 'Search sys id...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Scope',
    mode: COMMAND_MODES.SWITCH_APP,
    description: 'Switch to application scope',
    placeholderText: 'Switch application scope...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Go to',
    action: goto,
    mode: COMMAND_MODES.GO_TO,
    description: 'Shortcut with {table}.do / {table}.list',
    placeholderText: 'Shortcut with {table}.do / {table}.list',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'History',
    mode: COMMAND_MODES.HISTORY,
    description: 'Show history',
    placeholderText: 'Search history...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Documentation',
    action: searchDoc,
    mode: COMMAND_MODES.SEARCH_DOC,
    description: 'Search Servicenow development documentation',
    placeholderText: 'Search documentation...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Component',
    action: searchComponent,
    mode: COMMAND_MODES.SEARCH_COMP,
    description: 'Search Next Experience components',
    placeholderText: 'Search component...',
  },
  {
    key: crypto.randomUUID(),
    mode: COMMAND_MODES.ACTIONS, // 'actions' is a special mode for actions
    fullLabel: 'Actions',
    description: 'Show all actions',
    visible: false,
    placeholderText: 'Search actions...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Refresh',
    action: refreshApps,
    description: 'Refresh all application menus, scopes',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Clear cache',
    action: clearCache,
    description: 'Clear client cache',
  },
];

function findCommandByMode(mode) {
  return commands.find((item) => item.mode === mode);
}

export function getCommandLabelAndPlaceholder(mode) {
  const command = findCommandByMode(mode);
  return command ? [command.fullLabel, command.placeholderText] : mode;
}

/**
 * Get action of command
 * @param {string} commandMode - command mode
 * @returns Action callback of command
 */
export function getCommandAction(commandMode) {
  const command = findCommandByMode(commandMode);
  return command.action;
}

/**
 *  Check compact ui mode based on command mode
 *
 * @param {string} commandMode - command mode
 * @returns - true/false flag of checking result
 */
export function isCompactMode(commandMode) {
  return (
    commandMode &&
    ![COMMAND_MODES.SWITCH_APP, COMMAND_MODES.ACTIONS, COMMAND_MODES.HISTORY].includes(commandMode)
  );
}

/**
 * Check actions mode based on command mode
 *
 * @param {string} commandMode - command mode
 * @returns - true/false flag of showing all action modes
 */
export function isActionsMode(commandMode) {
  return commandMode && commandMode === COMMAND_MODES.ACTIONS;
}

/**
 *Check switching application scope mode based on command mode
 *
 * @param {string} commandMode - command mode
 * @returns - true/false flag of switching application scope
 */
export function isSwitchAppMode(commandMode) {
  return commandMode && commandMode === COMMAND_MODES.SWITCH_APP;
}

/**
 * Check history mode based on command mode
 * @param {string} commandMode - command mode
 * @returns true / false flag of checking history mode
 */
export function isHistoryMode(commandMode) {
  return commandMode && commandMode === COMMAND_MODES.HISTORY;
}

export default commands;
