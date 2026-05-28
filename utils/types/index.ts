export type CommandMode =
  | 'find_record'
  | 'search_doc'
  | 'search_comp'
  | 'switch_scope'
  | 'go_to'
  | 'actions'
  | 'history'
  | 'table';

export type CommandModeOrNull = CommandMode | null;

export interface CommandItem {
  key: string;
  label?: string;
  target?: string;
  fullLabel: string;
  subLabel?: string;
  parentLabel?: string;
  description?: string;
  mode?: CommandMode;
  placeholderText?: string;
  action?: (...args: any[]) => Promise<void> | void;
  visible?: boolean;
  icon?: React.ReactNode;
  sysId?: string;
}

export type LauncherErrorKind = 'auth' | 'network' | 'server' | 'schema';

export interface LauncherError {
  kind: LauncherErrorKind;
  message: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: LauncherError };

export type LauncherActionType =
  | 'TOGGLE_LAUNCHER_COMMAND'
  | 'OPEN_TAB_COMMAND'
  | 'SWITCH_SCOPE_COMMAND'
  | 'SEARCH_TABLE_COMMAND'
  | 'SEARCH_HISTORY_COMMAND'
  | 'SHOW_RECORD_XML_COMMAND'
  | 'OPEN_OPTIONS_COMMAND';

export type LauncherActionValue =
  | 'snl-toggle-launcher-command'
  | 'snl-open-tab-form-launcher-command'
  | 'snl-switch-scope-command'
  | 'snl-search-table-command'
  | 'snl-search-history-command'
  | 'snl-show-record-xml-command'
  | 'snl-open-options-command';
