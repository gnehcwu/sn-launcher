import {
  refreshMenu,
  fetchOrRetrieveApps,
  refreshApplications,
  clearCache,
  searchDoc,
  searchComponent,
  goto,
} from '../utils/api';

const commands = [
  {
    key: crypto.randomUUID(),
    fullLabel: 'Search document',
    action: searchDoc,
    mode: 'search_doc',
    description: 'search against Servicenow documentation',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Search component',
    action: searchComponent,
    mode: 'search_comp',
    description: 'search next experience components',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Switch application scope',
    action: fetchOrRetrieveApps,
    mode: 'switch_app',
    description: 'Switch to application scope',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Go to',
    action: goto,
    mode: 'go_to',
    description: 'shortcut with {table}.do / {table}.list',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Refresh menu',
    action: refreshMenu,
    description: 'refresh all menu items',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Refresh applications',
    action: refreshApplications,
    description: 'refresh all applications',
  },
  {
    key: crypto.randomUUID(),
    fullLabel: 'Clear cache',
    action: clearCache,
    description: 'clear client cache',
  },
];

function findCommandByMode(mode) {
  return commands.find((item) => item.mode === mode);
}

export function getCommandFullLabel(mode) {
  const command = findCommandByMode(mode);
  return command.fullLabel;
}

export function getCommandAction(mode) {
  const command = findCommandByMode(mode);
  return command.action;
}

export default commands;
