import React from 'react';
import { useFlightStore } from '../store/flight-store.js';

export default function ChecklistBeforeRelease({ flight }) {
  const updateFlight = useFlightStore((s) => s.updateFlight);
  const state = flight.checklist?.beforeRelease || {};

  const toggle = (key) => {
    updateFlight(flight.id, {
      checklist: {
        ...(flight.checklist || {}),
        beforeRelease: {
          ...state,
          [key]: !state[key],
        },
      },
    });
  };

  const Row = ({ label, keyName, rightText }) => (
    <label
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 0',
        fontSize: '14px',
      }}
    >
      <span>
        <input
          type="checkbox"
          checked={!!state[keyName]}
          onChange={() => toggle(keyName)}
          style={{ marginRight: '6px' }}
        />
        {label}
      </span>
      <span style={{ color: '#4b5563', fontStyle: 'italic' }}>{rightText}</span>
    </label>
  );

  return (
    <section style={{ marginTop: '24px' }}>
      <h3
        style={{
          background: '#111827',
          color: 'white',
          padding: '6px 10px',
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        BEFORE RELEASE
      </h3>
      <div
        style={{
          border: '1px solid #e5e7eb',
          padding: '8px 10px',
          background: 'white',
        }}
      >
        <Row label="QFU" keyName="qfu" rightText="Cohérents" />
        <Row label="État tech machine MEL/CDL" keyName="melCdl" rightText="Pris en compte" />
        <Row label="Limitations" keyName="limitations" rightText="Vérifiées" />
        <Row label="Carburant" keyName="fuel" rightText="Vérifié" />
        <Row label="Commentaires / Briefing" keyName="brief" rightText="Relus" />
        <Row label="Menaces & Stratégie" keyName="threats" rightText="Partagées (TEM)" />
        <Row label="IFPUV / ACK / ATC" keyName="ifpuAckAtc" rightText="Effectué/Recus" />
        <Row label="RELEASE" keyName="release" rightText="Envoyé" />
      </div>
    </section>
  );
}
