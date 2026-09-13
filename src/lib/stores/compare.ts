import { create } from "zustand";

interface CompareState {
  selectedIds: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  selectedIds: [],
  add: (id) =>
    set((state) => {
      if (state.selectedIds.length >= 4 || state.selectedIds.includes(id)) return state;
      return { selectedIds: [...state.selectedIds, id] };
    }),
  remove: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((i) => i !== id),
    })),
  toggle: (id) => {
    const state = get();
    if (state.selectedIds.includes(id)) {
      state.remove(id);
    } else {
      state.add(id);
    }
  },
  clear: () => set({ selectedIds: [] }),
  isSelected: (id) => get().selectedIds.includes(id),
}));