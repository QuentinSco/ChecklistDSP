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
          checklist: {
            beforeRelease: {
              qfu: false,
              melCdl: false,
              limitations: false,
              fuel: false,
              brief: false,
              threats: false,
              ifpuAckAtc: false,
              release: false,
            },
            // plus tard : afterRelease, cruise, beforeArrival...
          },
        },
      ],
    });
  },
  

  updateFlight: (id, patch) =>
    set({
      flights: get().flights.map((f) =>
        f.id === id ? { ...f, ...patch } : f
      ),
    }),

  selectFlight: (id) => set({ selectedId: id }),

  removeFlight: (id) =>
    set((state) => {
      const remaining = state.flights.filter((f) => f.id !== id);
      const newSelected =
        state.selectedId === id ? (remaining[0]?.id ?? null) : state.selectedId;
      return { flights: remaining, selectedId: newSelected };
    }),
}));
