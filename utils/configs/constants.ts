import { LauncherActionType, LauncherActionValue, CommandModeOrNull } from '@/utils/types';

export const MIN_MATCH_LENGTH = 2;
export const LOADER_DEFER_TIME = 150;
export const DEBOUNCE_DELAY = 200;
export const SPECIAL_CHARS = {
  EXTERNAL_LINK: ' ➚',
  SEPARATOR: ' › ',
} as const;
export const HOST_ELEMENT_ATTR_ID = 'sn-launcher-root';
export const SN_LAUNCHER_SEND_GCK_EVENT = `sn-launcher-send-gck`;
export const SN_LAUNCHER_RECAPTURE_GCK_EVENT = `sn-launcher-recapture-gck`;
export const SN_LAUNCHER_SEARCH_DOC_URL = `https://www.servicenow.com/docs/search?q=`;
export const SN_LAUNCHER_SEARCH_COMPONENT_URL = `https://developer.servicenow.com/dev.do#!/reference/next-experience/components?&order_by=score&limit=120&offset=0&categories[]=uib_component&query=`;
export const SN_LAUNCHER_SCOPE_ENDPOINT =
  'api/now/table/sys_scope?sysparm_query=ORDERBYDESCsys_updated_on&sysparm_display_value=true&sysparm_fields=sys_id%2Cscope%2Cname&sysparm_limit=500';
// Base path for paginated table fetches. `sysparm_limit` + `sysparm_offset` are
// added by service.ts#fetchTables, which loops until ServiceNow returns a
// short page.
export const SN_LAUNCHER_TABLE_ENDPOINT =
  'api/now/table/sys_db_object?sysparm_fields=label%2Cname&sysparm_display_value=true';
// 5000 fits the vast majority of instances in a single round-trip; pagination
// only kicks in beyond that. Stays well under ServiceNow's 10k default ceiling.
export const SN_LAUNCHER_TABLE_PAGE_SIZE = 5000;
export const SN_LAUNCHER_TABLE_MAX_PAGES = 6;
export const SN_LAUNCHER_MENU_ENDPOINT = 'api/now/ui/polaris/menu';
export const SN_LAUNCHER_HISTORY_ENDPOINT = 'api/now/ui/history';
export const SN_LAUNCHER_SWITCH_APP_ENDPOINT = 'api/now/ui/concoursepicker/application';
export const SN_LAUNCHER_TAB_PREFIX = 'now/nav/ui/classic/params/target/';
export const SN_LAUNCHER_SCRIPT_ENDPOINT = 'sys.scripts.do';
// sys_id of the well-known "Global" application scope in ServiceNow. Used as a
// fallback for sys.scripts.do when we can't read the user's current scope.
export const SN_LAUNCHER_GLOBAL_SCOPE_SYS_ID = 'e24e9692d7702100738dc0da9e6103dd';
export const SN_LAUNCHER_SEND_SCOPE_EVENT = 'sn-launcher-send-scope';
export const SN_LAUNCHER_HISTORY_MAX_ITEMS = 100;
export const SN_LAUNCHER_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
export const SN_LAUNCHER_ABOUT_URL = 'https://github.com/gnehcwu/sn-launcher';
export const SN_LAUNCHER_ACTIONS: Record<LauncherActionType, LauncherActionValue> = {
  TOGGLE_LAUNCHER_COMMAND: 'snl-toggle-launcher-command',
  OPEN_TAB_COMMAND: 'snl-open-tab-form-launcher-command',
  SWITCH_SCOPE_COMMAND: 'snl-switch-scope-command',
  SEARCH_TABLE_COMMAND: 'snl-search-table-command',
  SEARCH_HISTORY_COMMAND: 'snl-search-history-command',
  SHOW_RECORD_XML_COMMAND: 'snl-show-record-xml-command',
  OPEN_OPTIONS_COMMAND: 'snl-open-options-command',
} as const;
export const SN_LAUNCHER_SETTINGS_MENU_ID = 'settings';
export enum COMMAND_MODES {
  FIND_RECORD = 'find_record',
  SEARCH_DOC = 'search_doc',
  SEARCH_COMP = 'search_comp',
  SWITCH_SCOPE = 'switch_scope',
  GO_TO = 'go_to',
  ACTIONS = 'actions',
  HISTORY = 'history',
  TABLE = 'table',
}

interface CommandShortcutConfig {
  commandMode: CommandModeOrNull;
  title: string;
  isContextMenu: boolean;
  isDirectAction: boolean;
}

export const SN_LAUNCHER_COMMAND_SHORTCUTS: Partial<
  Record<LauncherActionValue, CommandShortcutConfig>
> = {
  [SN_LAUNCHER_ACTIONS.TOGGLE_LAUNCHER_COMMAND]: {
    commandMode: null,
    title: 'Open SN Launcher',
    isContextMenu: false,
    isDirectAction: false,
  },
  [SN_LAUNCHER_ACTIONS.SWITCH_SCOPE_COMMAND]: {
    commandMode: COMMAND_MODES.SWITCH_SCOPE,
    title: 'Switch scope',
    isContextMenu: true,
    isDirectAction: false,
  },
  [SN_LAUNCHER_ACTIONS.SEARCH_TABLE_COMMAND]: {
    commandMode: COMMAND_MODES.TABLE,
    title: 'Search table',
    isContextMenu: true,
    isDirectAction: false,
  },
  [SN_LAUNCHER_ACTIONS.SEARCH_HISTORY_COMMAND]: {
    commandMode: COMMAND_MODES.HISTORY,
    title: 'Search history',
    isContextMenu: true,
    isDirectAction: false,
  },
  [SN_LAUNCHER_ACTIONS.SHOW_RECORD_XML_COMMAND]: {
    commandMode: null,
    title: 'Show record XML',
    isContextMenu: true,
    isDirectAction: true,
  },
};
