import React, { useState } from 'react';
import { X, Sliders, Server, Users } from 'lucide-react';
import { SensorsTab } from './tabs/SensorsTab.jsx';
import { RacksTab } from './tabs/RacksTab.jsx';
import { UsersTab } from './tabs/UsersTab.jsx';

export const AdminManagementModal = ({ isOpen, onClose, onRefreshData, racks = [], sensors = [] }) => {
  const [tab, setTab] = useState('sensors');

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(5,8,17,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Datacenter Infrastructure Administration</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage Racks, Sensor Thresholds, and User Roles</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
          <button className={`btn ${tab === 'sensors' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('sensors')} style={{ fontSize: '13px', padding: '8px 16px' }}>
            <Sliders size={15} /> Sensors & Thresholds
          </button>
          <button className={`btn ${tab === 'racks' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('racks')} style={{ fontSize: '13px', padding: '8px 16px' }}>
            <Server size={15} /> Server Racks
          </button>
          <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('users')} style={{ fontSize: '13px', padding: '8px 16px' }}>
            <Users size={15} /> User Management
          </button>
        </div>

        {tab === 'sensors' && <SensorsTab sensors={sensors} racks={racks} onRefresh={onRefreshData} />}
        {tab === 'racks' && <RacksTab racks={racks} onRefresh={onRefreshData} />}
        {tab === 'users' && <UsersTab />}
      </div>
    </div>
  );
};
