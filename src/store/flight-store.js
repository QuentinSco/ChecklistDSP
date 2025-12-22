import { create } from 'zustand';

export const useFlightStore = create((set, get) => ({
  flights: [],
  selectedId: null,
  addFlight: (flight) => {
    const current = get().flights;
    if (current.length >= 15) return;
    set({ flights: [...current, { ...flight, id: Date.now() }] });
  },
  selectFlight: (id) => set({ selectedId: id }),
}));
