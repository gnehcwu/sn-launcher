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
    label: 'Search document',
    action: searchDoc,
    mode: 'search_doc',
    description: 'search against Servicenow documentation',
  },
  {
    key: crypto.randomUUID(),
    label: 'Search component',
    action: searchComponent,
    mode: 'search_comp',
    description: 'search next experience components',
  },
  {
    key: crypto.randomUUID(),
    label: 'Switch application scope',
    action: fetchOrRetrieveApps,
    mode: 'switch_app',
    description: 'Switch to application scope',
  },
  {
    key: crypto.randomUUID(),
    label: 'Go to',
    action: goto,
    mode: 'go_to',
    description: 'shortcut with {table}.do / {table}.list',
  },
  {
    key: crypto.randomUUID(),
    label: 'Refresh menu',
    action: refreshMenu,
    description: 'refresh all menu items',
  },
  {
    key: crypto.randomUUID(),
    label: 'Refresh applications',
    action: refreshApplications,
    description: 'refresh all applications',
  },
  {
    key: crypto.randomUUID(),
    label: 'Clear cache',
    action: clearCache,
    description: 'clear client cache',
  },
];

function findCommandByMode(mode) {
  return commands.find((item) => item.mode === mode);
}

export function getCommandLabel(mode) {
  const command = findCommandByMode(mode);
  return command.label;
}

export function getCommandAction(mode) {
  const command = findCommandByMode(mode);
  return command.action;
}

export default commands;
