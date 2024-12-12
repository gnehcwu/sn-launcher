export type CommandMode = 
  | 'find_record'
  | 'search_doc'
  | 'search_comp'
  | 'switch_scope'
  | 'go_to'
  | 'actions'
  | 'history'
  | 'table'
  | '';

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
}

export interface LauncherState {
  filter: string;
  selected: number;
  isShown: boolean;
  isLoading: boolean;
  commandMode: CommandMode;
  token: string | null;
  initialDataLoaded: boolean;
}