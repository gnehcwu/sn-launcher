import { LauncherActionType, LauncherActionValue } from '../../types';

export const MIN_MATCH_LENGTH = 2;
export const LOADER_DEFER_TIME = 150;
export const HOST_ELEMENT_ATTR_ID = 'sn-launcher-root';
export const SN_LAUNCHER_SEND_GCK_EVENT = `sn-launcher-send-gck`;
export const SN_LAUNCHER_SEARCH_DOC_URL = `https://www.servicenow.com/docs/search?q=`;
export const SN_LAUNCHER_SEARCH_COMPONENT_URL = `https://developer.servicenow.com/dev.do#!/reference/next-experience/components?&order_by=score&limit=120&offset=0&categories[]=uib_component&query=`;
export const SN_LAUNCHER_SCOPE_ENDPOINT =
  'api/now/table/sys_scope?sysparm_query=ORDERBYDESCsys_updated_on&sysparm_display_value=true&sysparm_fields=sys_id%2Cscope%2Cname';
export const SN_LAUNCHER_TABLE_ENDPOINT = 'api/now/table/sys_db_object?sysparm_fields=label%2Cname';
export const SN_LAUNCHER_MENU_ENDPOINT = 'api/now/ui/polaris/menu';
export const SN_LAUNCHER_SWITCH_APP_ENDPOINT = 'api/now/ui/concoursepicker/application';
export const SN_LAUNCHER_TAB_PREFIX = 'now/nav/ui/classic/params/target/';
export const SN_LAUNCHER_ACTIONS: Record<LauncherActionType, LauncherActionValue> = {
  TOGGLE_LAUNCHER_COMMAND: 'snl-toggle-launcher-command',
  OPEN_TAB_COMMAND: 'snl-open-tab-form-launcher-command',
  SWITCH_SCOPE_COMMAND: 'snl-switch-scope-command',
  SEARCH_TABLE_COMMAND: 'snl-search-table-command',
  SEARCH_HISTORY_COMMAND: 'snl-search-history-command',
} as const;
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
export const SN_LAUNCHER_COMMAND_SHORTCUTS = {
  [SN_LAUNCHER_ACTIONS.TOGGLE_LAUNCHER_COMMAND]: undefined,
  [SN_LAUNCHER_ACTIONS.SWITCH_SCOPE_COMMAND]: COMMAND_MODES.SWITCH_SCOPE,
  [SN_LAUNCHER_ACTIONS.SEARCH_TABLE_COMMAND]: COMMAND_MODES.TABLE,
  [SN_LAUNCHER_ACTIONS.SEARCH_HISTORY_COMMAND]: COMMAND_MODES.HISTORY,
} as const;
