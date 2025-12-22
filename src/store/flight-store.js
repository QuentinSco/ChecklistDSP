import { create } from 'zustand';

export const useFlightStore = create((set, get) => ({
  flights: [],
  selectedId: null,

  addFlight: (flight) => {
    const current = get().flights;
    if (current.length >= 15) return;
    set({
      flights: [
        ...current,
        {
          ...flight,
          id: Date.now(),
          arr: flight.arr || '',          // destination
          alternates: [],                 // array d’ICAO
        },
      ],
    });
  },

  updateFlight: (id, patch) => {
    set({
      flights: get().flights.map((f) =>
        f.id === id ? { ...f, ...patch } : f
      ),
    });
  },

  selectFlight: (id) => set({ selectedId: id }),
}));
