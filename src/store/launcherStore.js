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
  stamp: new Date().getTime(),
};

const useLauncherStore = create((set) => ({
  ...initialState,
  updateCommandMode: (commandMode, filter = '') => {
    set({ commandMode, filter });
  },
  reset: (isShown) => {
    set({ ...initialState, filter: '', selected: 0, commandMode: '', isShown: isShown ?? false });
  },
  updateSelected: (selected) => {
    set({ selected });
  },
  updateFilter: (filter) => set({ filter }),
  updateIsLoading: (isLoading) => set({ isLoading }),
  updateIsShown: (isShown) => set({ isShown }),
  updateStamp: () => set({ stamp: new Date().getTime() }),
}));

export default useLauncherStore;
