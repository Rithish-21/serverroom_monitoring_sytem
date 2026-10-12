import React from 'react';
import { Server, Settings, LogOut, Radio, Volume2, VolumeX, Download } from 'lucide-react';
import { exportAuditReportCsv, exportAuditReportJson } from '../../utils/exportUtils.js';

export const DashboardHeader = ({
  user,
  isAdmin,
  alarmMuted,
  setAlarmMuted,
  onOpenSettings,
  onLogout,
  sensors = [],
  alerts = [],
  healthScore = 100
}) => {
  return (
    <header style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Server size={18} color="#fff" />
        </div>
        <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.04em' }}>
          SENTINEL<span style={{ color: 'var(--primary)' }}>CORE</span>
          <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-normal'}`} style={{ marginLeft: '10px' }}>
            {isAdmin ? 'Admin Console' : 'Operator Console'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#34d399', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
          <Radio size={12} className="pulsing" /> Live Stream
        </div>

        {/* Feature 6: Audio Alarm Mute Toggle */}
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 10px', fontSize: '12px', color: alarmMuted ? 'var(--text-dim)' : 'var(--status-warning)' }}
          onClick={() => setAlarmMuted(!alarmMuted)}
          title={alarmMuted ? 'Alarm Siren is Muted' : 'Alarm Siren is Active'}
        >
          {alarmMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{alarmMuted ? 'Muted' : 'Siren ON'}</span>
        </button>

        {/* Feature 5: Export Audit Report */}
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 10px', fontSize: '12px' }}
          onClick={() => exportAuditReportCsv(sensors, alerts, healthScore)}
          title="Download compliance CSV audit log"
        >
          <Download size={14} /> Export CSV
        </button>

        {isAdmin && (
          <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={onOpenSettings}>
            <Settings size={14} /> Settings
          </button>
        )}

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{user?.full_name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{user?.email}</div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '7px' }} onClick={onLogout} title="Sign Out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
