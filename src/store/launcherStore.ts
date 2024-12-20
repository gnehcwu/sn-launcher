import { create } from 'zustand';
import type { CommandMode } from '@/types';

interface LauncherState {
  filter: string;
  commandMode: CommandMode | '';
  token: string;
  selected: number;
  isLoading: boolean;
  isShown: boolean;
}

interface LauncherActions {
  updateCommandMode: (commandMode: CommandMode | '', filter?: string) => void;
  reset: (isShown?: boolean) => void;
  updateSelected: (selected: number) => void;
  updateFilter: (filter: string) => void;
  updateIsLoading: (isLoading: boolean) => void;
  updateIsShown: (isShown: boolean) => void;
  updateToken: (token: string) => void;
}

const initialState: LauncherState = {
  filter: '',
  commandMode: '',
  token: '',
  selected: 0,
  isLoading: false,
  isShown: false,
};

const useLauncherStore = create<LauncherState & LauncherActions>((set) => ({
  ...initialState,
  updateCommandMode: (commandMode, filter = '') => {
    set({ commandMode, filter, selected: 0 });
  },
  reset: (isShown) => {
    set((state) => ({
      filter: '',
      selected: 0,
      commandMode: '',
      isShown: isShown ?? false,
      // reset will be called by commands
      // check isShown to avoid interfering
      // only reset isLoading when closing the palette
      isLoading: isShown === false ? false : state.isLoading,
    }));
  },
  updateSelected: (selected) => set({ selected }),
  updateFilter: (filter) => set({ filter, selected: 0 }),
  updateIsLoading: (isLoading) => set({ isLoading }),
  updateIsShown: (isShown) => set({ isShown }),
  updateToken: (token) => set({ token }),
}));

export default useLauncherStore;
