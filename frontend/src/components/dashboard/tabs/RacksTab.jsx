import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../../services/api.js';

export const RacksTab = ({ racks = [], onRefresh }) => {
  const [name, setName] = useState('');
  const [x, setX] = useState(0);
  const [z, setZ] = useState(0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      await api.post('/racks', { name, position_x: Number(x), position_y: 0, position_z: Number(z) });
      setName('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create rack');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this rack?')) return;
    try {
      await api.delete(`/racks/${id}`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete rack');
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '20px' }}>
        <div><label className="form-label">Rack Name</label><input className="form-input" style={{ padding: '8px' }} placeholder="Rack C-01" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div><label className="form-label">Position X</label><input className="form-input" type="number" step="0.5" style={{ padding: '8px' }} value={x} onChange={e => setX(e.target.value)} required /></div>
        <div><label className="form-label">Position Z</label><input className="form-input" type="number" step="0.5" style={{ padding: '8px' }} value={z} onChange={e => setZ(e.target.value)} required /></div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn btn-primary" style={{ padding: '9px 16px' }}><Plus size={14} /> Add Rack</button></div>
      </form>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {racks.map(rack => (
          <div key={rack.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>{rack.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>X: {rack.position_x}, Z: {rack.position_z}</div>
            </div>
            <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDelete(rack.id)}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
