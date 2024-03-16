import { clearCache, searchDoc, searchComponent, goto } from '../utils/api';

export const COMMAND_MODES = {
  FIND_RECORD: 'find_record',
  SEARCH_DOC: 'search_doc',
  SEARCH_COMP: 'search_comp',
  SWITCH_APP: 'switch_app',
  GO_TO: 'go_to',
  ACTIONS: 'actions',
  HISTORY: 'history',
  ALL_TABLES: 'all_tables',
};

/**
 * An array of objects representing the available commands in the application.
 * Each object contains a unique key, a full label, a mode, a sub label, a placeholder text, and an optional action.
 * @typedef {Object} Command
 * @property {string} key - A unique identifier for the command.
 * @property {string} fullLabel - The full label of the command.
 * @property {string} mode - The mode of the command.
 * @property {string} subLabel - The sub label of the command.
 * @property {string} placeholderText - The placeholder text for the command.
 * @property {function} [action] - An optional action to be executed when the command is triggered.
 * @property {boolean} [visible] - A flag indicating whether the command is visible or not.
 * @type {Command[]}
 */
const commands = [
  {
    key: crypto.randomUUID(),
    fullLabel: 'Tables',
    mode: COMMAND_MODES.ALL_TABLES,
    subLabel: 'Show all tables',
    placeholderText: 'search tables...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Scope',
    mode: COMMAND_MODES.SWITCH_APP,
    subLabel: 'Switch to application scope',
    placeholderText: 'Search application scope...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Record',
    mode: COMMAND_MODES.FIND_RECORD,
    subLabel: 'Find record by sys id',
    placeholderText: 'Search sys id...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'History',
    mode: COMMAND_MODES.HISTORY,
    subLabel: 'Show history',
    placeholderText: 'Search history...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Go to',
    action: goto,
    mode: COMMAND_MODES.GO_TO,
    subLabel: 'Shortcut with {table}.do / {table}.list',
    placeholderText: '{table}.do / {table}.list',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Documentation',
    action: searchDoc,
    mode: COMMAND_MODES.SEARCH_DOC,
    subLabel: 'Search Servicenow development documentation',
    placeholderText: 'Search documentation...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Component',
    action: searchComponent,
    mode: COMMAND_MODES.SEARCH_COMP,
    subLabel: 'Search Next Experience components',
    placeholderText: 'Search Next Experience component...',
  },
  {
    key: crypto.randomUUID(),
    mode: COMMAND_MODES.ACTIONS, // 'actions' is a special mode for actions
    fullLabel: 'Actions',
    subLabel: 'Show all actions',
    visible: false,
    placeholderText: 'Search actions...',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Refresh',
    subLabel: 'Refresh all application menus, scopes',
    visible: false,
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Clear cache',
    action: clearCache,
    subLabel: 'Clear client cache and refresh',
  },
];

/**
 * Finds a command object in the `commands` array that matches the given `mode`.
 * @param {string} mode - The mode to search for.
 * @returns {Object} - The command object that matches the given `mode`, or `undefined` if no match is found.
 */
function findCommandByMode(mode) {
  return commands.find((item) => item.mode === mode);
}

/**
 * Returns an array containing the full label and placeholder text for a given mode.
 * @param {string} mode - The mode to find the command for.
 * @returns {(string[]|string)} - An array containing the full label and placeholder text if a command is found, otherwise the mode string.
 */
export function getCommandLabelAndPlaceholder(mode) {
  const command = findCommandByMode(mode);
  return command ? [command.fullLabel, command.placeholderText] : mode;
}

/**
 * Returns the action associated with the given command mode.
 * @param {string} commandMode - The mode of the command.
 * @returns {string} - The action associated with the command mode.
 */
export function getCommandAction(commandMode) {
  const command = findCommandByMode(commandMode);
  return command.action;
}

/**
 * Determines if the given command mode is in compact mode.
 * @param {string} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is in compact mode, false otherwise.
 */
export function isCompactMode(commandMode) {
  return (
    commandMode &&
    ![
      COMMAND_MODES.SWITCH_APP,
      COMMAND_MODES.ACTIONS,
      COMMAND_MODES.HISTORY,
      COMMAND_MODES.ALL_TABLES,
    ].includes(commandMode)
  );
}

/**
 * Checks if the given command mode is in actions mode.
 * @param {string} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is in actions mode, false otherwise.
 */
export function isActionsMode(commandMode) {
  return commandMode === COMMAND_MODES.ACTIONS;
}

/**
 * Checks if the given command mode is for switching the app.
 * @param {string} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is for switching the app, false otherwise.
 */
export function isSwitchAppMode(commandMode) {
  return commandMode === COMMAND_MODES.SWITCH_APP;
}

export function isTablesMode(commandMode) {
  return commandMode === COMMAND_MODES.ALL_TABLES;
}

/**
 * Checks if the given command mode is history mode.
 * @param {string} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is history mode, false otherwise.
 */
export function isHistoryMode(commandMode) {
  return commandMode === COMMAND_MODES.HISTORY;
}

/**
 * Checks if the given command mode is set to "refresh".
 * @param {string} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is "refresh", false otherwise.
 */
export function isRefreshMode(commandMode) {
  return commandMode === COMMAND_MODES.REFRESH;
}

/**
 * Checks if the given command mode is in "find record" mode.
 * @param {string} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is in "find record" mode, false otherwise.
 */
export function isFindSysIdMode(commandMode) {
  return commandMode === COMMAND_MODES.FIND_RECORD;
}

/**
 * Checks if the command mode is shortcut mode.
 * @param {string} commandMode - The command mode to check.
 * @returns {boolean} - True if the command mode is shortcut mode, false otherwise.
 */
export function isShortcutMode(commandMode) {
  return commandMode === COMMAND_MODES.GO_TO;
}

export default commands;
