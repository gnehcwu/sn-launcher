import { create } from 'zustand';
import getToken from '../utils/getToken';

const token = getToken();

const initialState = {
  filter: '',
  commandMode: '',
  token,
  selected: 0,
  isLoading: false,
};

const useLauncherStore = create((set) => ({
  ...initialState,
  updateCommandMode: (commandMode) => {
    set({ commandMode, filter: '' });
  },
  reset: () => {
    set({ ...initialState, filter: '', selected: 0, commandMode: '' });
  },
  updateSelected: (selected) => {
    set({ selected });
  },
  updateFilter: (filter) => set({ filter }),
  updateIsLoading: (isLoading) => set({ isLoading }),
}));

export default useLauncherStore;
