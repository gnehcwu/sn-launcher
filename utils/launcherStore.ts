import { create } from 'zustand';
import type { CommandMode, CommandModeOrNull, LauncherError } from '@/utils/types';

interface LauncherState {
  filter: string;
  commandMode: CommandModeOrNull;
  token: string;
  scopeSysId: string | null;
  userSysId: string | null;
  selected: number;
  isLoading: boolean;
  // In-flight background revalidations (SWR refreshes that serve cached data
  // immediately), keyed by cache key (`menus` / `tables` / `scopes`). Per-key
  // counts (not a single number) so the header can show the "refreshing"
  // spinner only for the list backing the current mode, not for a background
  // warm of a list the user isn't viewing. Distinct from `isLoading`, which is
  // the blocking first-load skeleton.
  revalidating: Record<string, number>;
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
  beginRevalidate: (key: string) => void;
  endRevalidate: (key: string) => void;
  setToken: (token: string) => void;
  setScope: (scopeSysId: string | null) => void;
  setUserSysId: (userSysId: string | null) => void;
  setError: (error: LauncherError | null) => void;
}

const initialState: LauncherState = {
  filter: '',
  commandMode: null,
  token: '',
  scopeSysId: null,
  userSysId: null,
  selected: 0,
  isLoading: false,
  revalidating: {},
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
  beginRevalidate: (key) =>
    set((state) => ({
      revalidating: { ...state.revalidating, [key]: (state.revalidating[key] ?? 0) + 1 },
    })),
  endRevalidate: (key) =>
    set((state) => {
      const next = (state.revalidating[key] ?? 0) - 1;
      const revalidating = { ...state.revalidating };
      if (next > 0) revalidating[key] = next;
      else delete revalidating[key];
      return { revalidating };
    }),
  setToken: (token) => set({ token }),
  setScope: (scopeSysId) => set({ scopeSysId }),
  setUserSysId: (userSysId) => set({ userSysId }),
  setError: (error) => set({ error }),
}));

export default useLauncherStore;
