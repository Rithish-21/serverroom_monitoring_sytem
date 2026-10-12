import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../../services/api.js';

export const SensorsTab = ({ sensors = [], racks = [], onRefresh }) => {
  const [sensorLabel, setSensorLabel] = useState('');
  const [sensorType, setSensorType] = useState('temperature');
  const [sensorRackId, setSensorRackId] = useState('');
  const [sensorUnit, setSensorUnit] = useState('°C');
  const [sensorWarn, setSensorWarn] = useState(27.0);
  const [sensorCrit, setSensorCrit] = useState(32.0);

  const [editingId, setEditingId] = useState(null);
  const [editWarn, setEditWarn] = useState('');
  const [editCrit, setEditCrit] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sensors', {
        rack_id: sensorRackId ? Number(sensorRackId) : null,
        type: sensorType,
        label: sensorLabel,
        unit: sensorUnit,
        warning_limit: Number(sensorWarn),
        critical_limit: Number(sensorCrit)
      });
      setSensorLabel('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create sensor');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/sensors/${id}`, { warning_limit: Number(editWarn), critical_limit: Number(editCrit) });
      setEditingId(null);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update thresholds');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sensor?')) return;
    try {
      await api.delete(`/sensors/${id}`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete sensor');
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
        <div>
          <label className="form-label">Sensor Label</label>
          <input className="form-input" style={{ padding: '8px' }} placeholder="Rack C01 Temp" value={sensorLabel} onChange={e => setSensorLabel(e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Type</label>
          <select className="form-input" style={{ padding: '8px' }} value={sensorType} onChange={e => {
            setSensorType(e.target.value);
            setSensorUnit(e.target.value === 'temperature' ? '°C' : e.target.value === 'humidity' ? '%' : e.target.value === 'airflow' ? 'm/s' : e.target.value === 'power' ? 'kW' : 'status');
          }}>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="airflow">Airflow</option>
            <option value="power">Power</option>
            <option value="smoke">Smoke</option>
            <option value="water_leak">Water Leak</option>
          </select>
        </div>
        <div>
          <label className="form-label">Rack</label>
          <select className="form-input" style={{ padding: '8px' }} value={sensorRackId} onChange={e => setSensorRackId(e.target.value)}>
            <option value="">(Ambient)</option>
            {racks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Warn Limit</label>
          <input className="form-input" type="number" step="0.1" style={{ padding: '8px' }} value={sensorWarn} onChange={e => setSensorWarn(e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Crit Limit</label>
          <input className="form-input" type="number" step="0.1" style={{ padding: '8px' }} value={sensorCrit} onChange={e => setSensorCrit(e.target.value)} required />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '9px' }}><Plus size={14} /> Add</button>
        </div>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#fff' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-muted)' }}>
            <th style={{ padding: '8px' }}>Sensor</th>
            <th style={{ padding: '8px' }}>Type</th>
            <th style={{ padding: '8px' }}>Warn Limit</th>
            <th style={{ padding: '8px' }}>Crit Limit</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sensors.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '10px 8px', fontWeight: '600' }}>{s.label}</td>
              <td style={{ padding: '10px 8px', color: 'var(--text-dim)' }}>{s.type}</td>
              <td style={{ padding: '10px 8px' }}>
                {editingId === s.id ? <input className="form-input" type="number" step="0.1" style={{ width: '70px', padding: '4px' }} value={editWarn} onChange={e => setEditWarn(e.target.value)} /> : `${s.warning_limit} ${s.unit}`}
              </td>
              <td style={{ padding: '10px 8px' }}>
                {editingId === s.id ? <input className="form-input" type="number" step="0.1" style={{ width: '70px', padding: '4px' }} value={editCrit} onChange={e => setEditCrit(e.target.value)} /> : `${s.critical_limit} ${s.unit}`}
              </td>
              <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                {editingId === s.id ? (
                  <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '6px' }} onClick={() => handleUpdate(s.id)}>Save</button>
                ) : (
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '6px' }} onClick={() => { setEditingId(s.id); setEditWarn(s.warning_limit); setEditCrit(s.critical_limit); }}>Edit</button>
                )}
                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleDelete(s.id)}><Trash2 size={12} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
