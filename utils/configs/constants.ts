import { LauncherActionType, LauncherActionValue, CommandModeOrNull } from '@/utils/types';

export const MIN_MATCH_LENGTH = 2;
// commandScore is a loose subsequence matcher — a real prefix/word match scores
// ~0.9-1.0, scattered junk scores ≤ ~0.17. Above this, Impersonate trusts the
// loaded list; below it, the typed text is treated as "no good local match" and
// routed to the server lookup.
export const IMPERSONATE_LOCAL_MATCH_THRESHOLD = 0.5;
export const LOADER_DEFER_TIME = 150;
export const DEBOUNCE_DELAY = 200;
export const SPECIAL_CHARS = {
  EXTERNAL_LINK: ' ➚',
  SEPARATOR: ' › ',
} as const;
export const HOST_ELEMENT_ATTR_ID = 'sn-launcher-root';
export const SN_LAUNCHER_SEND_GCK_EVENT = `sn-launcher-send-gck`;
export const SN_LAUNCHER_RECAPTURE_GCK_EVENT = `sn-launcher-recapture-gck`;
export const SN_LAUNCHER_SEARCH_DOC_URL = `https://www.servicenow.com/docs/search?query=`;
export const SN_LAUNCHER_SEARCH_COMPONENT_URL = `https://developer.servicenow.com/dev.do#!/reference/next-experience/components?&order_by=score&limit=120&offset=0&categories[]=uib_component&query=`;
// Base path for the scope switcher. `sysparm_limit` + `sysparm_offset` are added
// by service.ts#fetchScopes, which paginates like fetchTables/fetchUsers so the
// full set is fuzzy-filtered client-side (no fixed cap). Cached for 60 min.
export const SN_LAUNCHER_SCOPE_ENDPOINT =
  'api/now/table/sys_scope?sysparm_query=ORDERBYDESCsys_updated_on&sysparm_display_value=true&sysparm_fields=sys_id%2Cscope%2Cname';
// 5000 × 2 = 10k scopes covers every instance in at most two round-trips; in
// practice sys_scope holds far fewer, so it's a single page.
export const SN_LAUNCHER_SCOPE_PAGE_SIZE = 5000;
export const SN_LAUNCHER_SCOPE_MAX_PAGES = 2;
// Base path for the in-progress update set list. service.ts#fetchUpdateSets adds
// the `sysparm_query` (state=in progress, scoped to the current app when known).
// NOT cached — devs create/switch sets constantly, so the list must stay live.
export const SN_LAUNCHER_UPDATE_SET_ENDPOINT =
  'api/now/table/sys_update_set?sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Capplication&sysparm_limit=100';
// Concourse update set picker. PUT { name, sysId } sets the session's current
// update set (mirrors the application picker used by switchToAppById).
export const SN_LAUNCHER_UPDATE_SET_PICKER_ENDPOINT = 'api/now/ui/concoursepicker/updateset';
// Base path for the Impersonate picker's active-user fetch. `sysparm_limit` +
// `sysparm_offset` are added by service.ts#fetchUsers, which paginates like
// fetchTables (so the full set is fuzzy-filtered client-side). NOT cached — user
// records are PII and active/role state must stay live.
export const SN_LAUNCHER_USER_ENDPOINT =
  'api/now/table/sys_user?sysparm_query=active=true%5EORDERBYname&sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Cuser_name%2Cemail';
// 5000 × 2 = 10k active users covers most instances in two round-trips. Beyond
// that cap, server-side search-as-you-type would be the move (see ROADMAP).
export const SN_LAUNCHER_USER_PAGE_SIZE = 5000;
export const SN_LAUNCHER_USER_MAX_PAGES = 2;
// Fallback server-side search (Impersonate mode) when the typed text matches no
// loaded user. Bounded + debounced; service.ts#searchUsers appends the
// `sysparm_query` (nameLIKE / user_nameLIKE / emailLIKE). Substring match, not
// fuzzy — but it returns real, selectable users (impersonate by their sys_id).
export const SN_LAUNCHER_USER_SEARCH_ENDPOINT =
  'api/now/table/sys_user?sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Cuser_name%2Cemail&sysparm_limit=30';
// Base path for impersonation; the target user's sys_id is appended:
// POST api/now/ui/impersonate/<sys_id> with an empty JSON body.
export const SN_LAUNCHER_IMPERSONATE_ENDPOINT = 'api/now/ui/impersonate';
// Base path for paginated table fetches. `sysparm_limit` + `sysparm_offset` are
// added by service.ts#fetchTables, which loops until ServiceNow returns a
// short page.
export const SN_LAUNCHER_TABLE_ENDPOINT =
  'api/now/table/sys_db_object?sysparm_fields=sys_id%2Clabel%2Cname&sysparm_display_value=true';
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
export const SN_LAUNCHER_SEND_USER_EVENT = 'sn-launcher-send-user';
export const SN_LAUNCHER_HISTORY_MAX_ITEMS = 100;
// Hard expiry and the sole age-based refresh: past this we block and refetch.
// There is no shorter "stale" window — within the TTL, cached data is only
// revalidated when a tab-focus event signals something may have changed
// elsewhere (see cachedList in service.ts). So a focused single-tab user, who
// never fires a focus event, refreshes at most once per TTL.
export const SN_LAUNCHER_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
// Cache keys passed to cachedList — also used to map a command mode to the list
// it backs, so the header's "refreshing" spinner can be scoped to the mode the
// user is actually viewing (see PaletteHeader#cacheKeyForMode). Keep in sync
// with the cachedList(...) call sites in service.ts.
export const SN_LAUNCHER_CACHE_KEYS = {
  MENUS: 'menus',
  TABLES: 'tables',
  SCOPES: 'scopes',
} as const;
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
  IMPERSONATE = 'impersonate',
  SWITCH_UPDATE_SET = 'switch_update_set',
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
