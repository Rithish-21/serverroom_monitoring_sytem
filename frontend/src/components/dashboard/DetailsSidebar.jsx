import React, { useEffect, useState } from 'react';
import { X, Server, Activity, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';
import { HistoryChart } from './HistoryChart.jsx';

export const DetailsSidebar = ({
  selectedRack,
  selectedSensor,
  allSensors = [],
  onClose,
  onSelectSensor
}) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedSensor) {
        setLoadingHistory(true);
        try {
          const res = await api.get(`/sensors/${selectedSensor.id}/history`);
          setHistory(res.data.data || []);
        } catch (err) {
          console.error('Failed to load sensor history', err);
        } finally {
          setLoadingHistory(false);
        }
      }
    };
    fetchHistory();
  }, [selectedSensor]);

  if (!selectedRack && !selectedSensor) return null;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '360px',
        maxHeight: 'calc(100% - 40px)',
        zIndex: 10,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedRack ? <Server size={18} color="var(--primary)" /> : <Activity size={18} color="var(--primary)" />}
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
            {selectedRack ? selectedRack.name : selectedSensor.label}
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {selectedRack && (
        <div>
          <div style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div>Position: X: {selectedRack.position_x}, Y: {selectedRack.position_y}, Z: {selectedRack.position_z}</div>
          </div>

          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '10px' }}>Rack Mounted Telemetry</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allSensors.filter(s => s.rack_id === selectedRack.id).length === 0 ? (
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>No sensors assigned to this rack.</span>
            ) : (
              allSensors.filter(s => s.rack_id === selectedRack.id).map(sensor => (
                <div
                  key={sensor.id}
                  onClick={() => onSelectSensor(sensor)}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{sensor.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{sensor.type}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {sensor.current_value} {sensor.unit}
                    </span>
                    <ArrowRight size={14} color="var(--primary)" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedSensor && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className={`badge badge-${selectedSensor.status || 'normal'}`}>
              {selectedSensor.status || 'NORMAL'}
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {selectedSensor.current_value} {selectedSensor.unit}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Warning Limit:</span>
              <span style={{ color: 'var(--status-warning)', fontWeight: '600' }}>{selectedSensor.warning_limit} {selectedSensor.unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Critical Limit:</span>
              <span style={{ color: 'var(--status-critical)', fontWeight: '600' }}>{selectedSensor.critical_limit} {selectedSensor.unit}</span>
            </div>
          </div>

          <HistoryChart
            title={`${selectedSensor.label} Trend`}
            readings={history}
            unit={selectedSensor.unit}
          />
        </div>
      )}
    </div>
  );
};
