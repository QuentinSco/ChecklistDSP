import React, { useState, useEffect } from 'react';
import { useFlightStore } from '../store/flight-store.js';

const aeroDate = (iso) => {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const yy = String(year).slice(-2);
  const mmm = months[month - 1] || '???';
  const dd = String(day).padStart(2, '0');
  return `${dd}${mmm}${yy}`;
};

const catFrom = (metar) => metar?.fltCat || 'UNK';

const colorFor = (cat) =>
  cat === 'VFR'  ? 'green'  :
  cat === 'MVFR' ? 'blue'   :
  cat === 'IFR'  ? 'orange' :
  cat === 'LIFR' ? 'red'    : 'grey';

export default function FlightApp() {
  const { flights, selectedId, addFlight, selectFlight, removeFlight } = useFlightStore();
  const [wx, setWx] = useState(null); // { depMetar, arrMetar, depTaf, arrTaf }
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const selectedFlight = flights.find((f) => f.id === selectedId) || null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const num  = form.get('flight').toString().toUpperCase();
    const depInput = form.get('dep').toString().toUpperCase();
    const date = form.get('date').toString();

    let dep = depInput;
    let arr = '';

    try {
      const res = await fetch('/api/flight-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flight: num }),
      });
      const info = await res.json();

      // On remplace le départ saisi par celui de l’API si dispo
      dep = info.originIcao || depInput;
      arr = info.destIcao || '';
    } catch (e) {
      arr = '';
    }

    addFlight({ num, dep, arr, date });
    event.currentTarget.reset();
  };

  useEffect(() => {
    const loadWx = async () => {
      if (!selectedFlight) {
        setWx(null);
        return;
      }

      try {
        const dep = selectedFlight.dep;
        const arr = selectedFlight.arr;

        // METAR départ
        const mDepRes = await fetch(`/api/metar/${dep}`);
        const mDepData = await mDepRes.json();
        const depMetar = Array.isArray(mDepData) ? mDepData[0] : null;

        // METAR arrivée
        let arrMetar = null;
        if (arr) {
          const mArrRes = await fetch(`/api/metar/${arr}`);
          const mArrData = await mArrRes.json();
          arrMetar = Array.isArray(mArrData) ? mArrData[0] : null;
        }

        // TAF départ
        const tDepRes = await fetch(`/api/taf/${dep}`);
        const tDepData = await tDepRes.json();
        const depTaf = Array.isArray(tDepData) ? tDepData[0] : null;

        // TAF arrivée
        let arrTaf = null;
        if (arr) {
          const tArrRes = await fetch(`/api/taf/${arr}`);
          const tArrData = await tArrRes.json();
          arrTaf = Array.isArray(tArrData) ? tArrData[0] : null;
        }

        setWx({ depMetar, arrMetar, depTaf, arrTaf });
      } catch (e) {
        setWx(null);
      }
    };

    loadWx();
  }, [selectedFlight]);

  const depCat = catFrom(wx?.depMetar);
  const arrCat = catFrom(wx?.arrMetar);

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
  <div
    key={f.id}
    style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '4px',
    }}
  >
    <button
      type="button"
      onClick={() => selectFlight(f.id)}
      style={{
        flex: 1,
        textAlign: 'left',
        padding: '6px',
        background: f.id === selectedId ? '#1d4ed8' : '#111827',
        border: '1px solid #374151',
        color: 'white',
        cursor: 'pointer',
      }}
    >
      {f.num} – {f.dep}{f.arr ? ` – ${f.arr}` : ''} – {aeroDate(f.date)}
    </button>
    <button
      type="button"
      onClick={() => removeFlight(f.id)}
      style={{
        marginLeft: '4px',
        padding: '0 6px',
        background: '#7f1d1d',
        border: '1px solid #b91c1c',
        color: 'white',
        cursor: 'pointer',
      }}
      aria-label="Supprimer ce vol"
    >
      ×
    </button>
  </div>
))}

        </div>
      </aside>

      {/* Zone principale */}
      <main style={{ flex: 1, padding: '24px', boxSizing: 'border-box' }}>
        {!selectedFlight && <p>Sélectionnez un vol dans la liste à gauche.</p>}

        {selectedFlight && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
              Vol {selectedFlight.num} – DEP {selectedFlight.dep}
              {selectedFlight.arr && ` – DEST ${selectedFlight.arr}`}
            </h2>

            <p style={{ marginBottom: '16px' }}>
              Date : {aeroDate(selectedFlight.date)}
            </p>

            {/* Météo départ / arrivée */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              {/* Départ */}
              <div style={{ flex: 1 }}>
                <strong>Départ {selectedFlight.dep}</strong>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '4px 0 8px',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '999px',
                      backgroundColor: colorFor(depCat),
                    }}
                  ></div>
                  <span>Catégorie : {depCat}</span>
                </div>
                <pre
                  style={{
                    background: '#f3f4f6',
                    padding: '8px',
                    marginBottom: '4px',
                  }}
                >
                  {wx?.depMetar ? wx.depMetar.rawOb : 'METAR indisponible'}
                </pre>
                const tafText = (taf) = taf?.rawOb || taf?.raw_text || '';

<pre style={{ background: '#f9fafb', padding: '8px' }}>
  {wx?.depTaf ? tafText(wx.depTaf) : 'TAF indisponible'}
</pre>

<pre style={{ background: '#f9fafb', padding: '8px' }}>
  {wx?.arrTaf ? tafText(wx.arrTaf) : 'TAF indisponible'}
</pre>

              </div>

              {/* Arrivée */}
              {selectedFlight.arr && (
                <div style={{ flex: 1 }}>
                  <strong>Arrivée {selectedFlight.arr}</strong>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '4px 0 8px',
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '999px',
                        backgroundColor: colorFor(arrCat),
                      }}
                    ></div>
                    <span>Catégorie : {arrCat}</span>
                  </div>
                  <pre
                    style={{
                      background: '#f3f4f6',
                      padding: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    {wx?.arrMetar ? wx.arrMetar.rawOb : 'METAR indisponible'}
                  </pre>
                  <pre style={{ background: '#f9fafb', padding: '8px' }}>
                    {wx?.arrTaf ? wx.arrTaf.rawOb : 'TAF indisponible'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
