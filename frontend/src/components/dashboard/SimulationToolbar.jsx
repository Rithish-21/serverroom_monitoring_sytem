import React, { useState } from 'react';
import { Flame, Droplets, RotateCcw, AlertOctagon, Check } from 'lucide-react';
import api from '../../services/api.js';

export const SimulationToolbar = ({ onSimulateSuccess }) => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const triggerEvent = async (event) => {
    setLoading(true);
    setActiveEvent(event);
    try {
      await api.post('/sensors/simulate-event', { event });
      onSimulateSuccess && onSimulateSuccess(event);
    } catch (err) {
      console.error('Failed to trigger simulation event', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(15, 23, 42, 0.85)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertOctagon size={16} color="var(--primary)" />
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Emergency Drills & Incident Simulator:</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Test live alarms and 3D response)</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
          onClick={() => triggerEvent('thermal_spike')}
          disabled={loading}
        >
          <Flame size={13} /> Thermal Runaway (34.8°C)
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
          onClick={() => triggerEvent('water_leak')}
          disabled={loading}
        >
          <Droplets size={13} /> Water Leak Ribbon
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
          onClick={() => triggerEvent('reset')}
          disabled={loading}
        >
          <RotateCcw size={13} /> Reset to Baseline
        </button>
      </div>
    </div>
  );
};
