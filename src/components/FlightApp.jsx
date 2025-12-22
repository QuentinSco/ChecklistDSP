import React, { useState, useEffect } from 'react';
import { useFlightStore } from '../store/flight-store.js';

export default function FlightApp() {
  const { flights, selectedId, addFlight, selectFlight } = useFlightStore();
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"


  const selectedFlight = flights.find((f) => f.id === selectedId) || null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addFlight({
      num: form.get('flight').toString().toUpperCase(),
      dep: form.get('dep').toString().toUpperCase(),
      date: form.get('date').toString(),
    });
    event.currentTarget.reset();
  };

  useEffect(() => {
    const loadWx = async () => {
      if (!selectedFlight) {
        setMetar(null);
        setTaf(null);
        return;
      }

      try {
        const mRes = await fetch(`/api/metar/${selectedFlight.dep}`);
        const mData = await mRes.json();
        const metarObj = Array.isArray(mData) ? mData[0] : null;

        const tRes = await fetch(`/api/taf/${selectedFlight.dep}`);
        const tData = await tRes.json();
        const tafObj = Array.isArray(tData) ? tData[0] : null;

        setMetar(metarObj);
        setTaf(tafObj);
      } catch (e) {
        setMetar(null);
        setTaf(null);
      }
    };

    loadWx();
  }, [selectedFlight]);

  const cat = metar?.fltCat || 'UNK';
  const color =
    cat === 'VFR'
      ? 'green'
      : cat === 'MVFR'
      ? 'blue'
      : cat === 'IFR'
      ? 'orange'
      : cat === 'LIFR'
      ? 'red'
      : 'grey';

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Sidebar vols */}
      <aside
        style={{
          width: '260px',
          background: '#111827',
          color: 'white',
          padding: '12px',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          DSP Checklist
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{ marginBottom: '16px', fontSize: '14px' }}
        >
          <input
            name="flight"
            placeholder="AF1234"
            required
            style={{ width: '100%', marginBottom: '4px', padding: '6px' }}
          />
          <input
            name="dep"
            placeholder="LFPG"
            defaultValue="LFPG"
            required
            maxLength={4}
            style={{ width: '100%', marginBottom: '4px', padding: '6px' }}
          />
          <input
            type="date"
            name="date"
            defaultValue={today}
            required
            style={{ width: '100%', marginBottom: '6px', padding: '6px' }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '6px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Ajouter
          </button>
        </form>

        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          {flights.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => selectFlight(f.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                marginBottom: '4px',
                padding: '6px',
                background: f.id === selectedId ? '#1d4ed8' : '#111827',
                border: '1px solid #374151',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              {f.num} – {f.dep} – {f.date}
            </button>
          ))}
        </div>
      </aside>

      {/* Zone principale */}
      <main style={{ flex: 1, padding: '24px', boxSizing: 'border-box' }}>
        {!selectedFlight && <p>Sélectionnez un vol dans la liste à gauche.</p>}

        {selectedFlight && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
              Vol {selectedFlight.num} – départ {selectedFlight.dep}
            </h2>
            <p style={{ marginBottom: '16px' }}>Date : {selectedFlight.date}</p>

            {/* METAR + rond couleur */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  backgroundColor: color,
                }}
              ></div>
              <div>Catégorie : {cat}</div>
            </div>

            <pre style={{ background: '#f3f4f6', padding: '12px' }}>
  {metar ? metar.rawOb : 'METAR indisponible'}
</pre>


            {/* plus tard : affichage TAF */}
          </div>
        )}
      </main>
    </div>
  );
}
