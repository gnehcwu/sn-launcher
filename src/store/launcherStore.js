import { create } from 'zustand';

const initialState = {
  filter: '',
  selectedMenu: null,
  commandMode: '',
};

const useLauncherStore = create((set) => ({
  ...initialState,
  updateCommandMode: (commandMode) => {
    set({ commandMode, filter: '' });
  },
  reset: () => {
    set(initialState);
  },
  updateSelectedMenu: (selectedMenu) => {
    set({ selectedMenu });
  },
  updateFilter: (filter) => set({ filter }),
}));

export default useLauncherStore;
