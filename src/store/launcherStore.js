import { create } from 'zustand';
import getToken from '../utils/getToken';

const token = getToken();

const initialState = {
  filter: '',
  commandMode: '',
  token,
  selected: 0,
  isLoading: false,
  isShown: false,
  initialDataLoaded: false,
};

const useLauncherStore = create((set) => ({
  ...initialState,
  updateCommandMode: (commandMode, filter = '') => {
    set({ commandMode, filter, selected: 0 });
  },
  reset: (isShown) => {
    set({ filter: '', selected: 0, commandMode: '', isShown: isShown ?? false, isLoading: false });
  },
  updateSelected: (selected) => {
    set({ selected });
  },
  updateFilter: (filter) => set({ filter, selected: 0 }),
  updateIsLoading: (isLoading) => set({ isLoading }),
  updateIsShown: (isShown) => set({ isShown }),
  updateInitialDataLoaded: () => set({ initialDataLoaded: true }),
}));

export default useLauncherStore;
