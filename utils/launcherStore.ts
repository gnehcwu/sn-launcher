import { create } from 'zustand';
import type { CommandMode, CommandModeOrNull, LauncherError } from '@/utils/types';

interface LauncherState {
  filter: string;
  commandMode: CommandModeOrNull;
  token: string;
  scopeSysId: string | null;
  selected: number;
  isLoading: boolean;
  isShown: boolean;
  error: LauncherError | null;
}

interface LauncherActions {
  // Intent-named actions — prefer these in components.
  open: (mode?: CommandMode | null) => void;
  close: () => void;
  enterMode: (mode: CommandMode, filter?: string) => void;
  exitMode: () => void;
  setFilter: (filter: string) => void;
  setSelected: (selected: number) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string) => void;
  setScope: (scopeSysId: string | null) => void;
  setError: (error: LauncherError | null) => void;
}

const initialState: LauncherState = {
  filter: '',
  commandMode: null,
  token: '',
  scopeSysId: null,
  selected: 0,
  isLoading: false,
  isShown: false,
  error: null,
};

const useLauncherStore = create<LauncherState & LauncherActions>((set) => ({
  ...initialState,
  open: (mode = null) =>
    set({
      isShown: true,
      filter: '',
      commandMode: mode,
      selected: 0,
      error: null,
    }),
  close: () =>
    set({
      isShown: false,
      filter: '',
      commandMode: null,
      selected: 0,
      isLoading: false,
      error: null,
    }),
  enterMode: (mode, filter = '') =>
    set({ commandMode: mode, filter, selected: 0, error: null }),
  exitMode: () => set({ commandMode: null, filter: '', selected: 0, error: null }),
  setFilter: (filter) => set({ filter, selected: 0 }),
  setSelected: (selected) => set({ selected }),
  setLoading: (isLoading) => set({ isLoading }),
  setToken: (token) => set({ token }),
  setScope: (scopeSysId) => set({ scopeSysId }),
  setError: (error) => set({ error }),
}));

export default useLauncherStore;
