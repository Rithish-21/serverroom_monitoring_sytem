import React from 'react';
import { AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';

export const AlertFeed = ({ alerts = [], onAcknowledge }) => {
  const getIcon = (level) => {
    switch (level) {
      case 'critical':
        return <AlertCircle size={16} color="var(--status-critical)" />;
      case 'warning':
        return <AlertTriangle size={16} color="var(--status-warning)" />;
      default:
        return <Info size={16} color="var(--primary)" />;
    }
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '0.02em' }}>Live Incident Feed</h3>
        <span className="badge badge-normal" style={{ fontSize: '11px' }}>
          {alerts.length} Records
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '13px' }}>No active environmental alarms detected.</p>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>System operating normally.</span>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '12px',
                background: alert.is_acknowledged ? 'rgba(15, 23, 42, 0.4)' : 'rgba(30, 41, 59, 0.65)',
                border: `1px solid ${alert.level === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderLeft: `4px solid ${
                  alert.level === 'critical'
                    ? 'var(--status-critical)'
                    : alert.level === 'warning'
                      ? 'var(--status-warning)'
                      : 'var(--primary)'
                }`,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ marginTop: '2px' }}>{getIcon(alert.level)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff', textTransform: 'uppercase' }}>
                    {alert.level}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {formatTime(alert.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '8px' }}>
                  {alert.message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {alert.is_acknowledged ? (
                    <span style={{ fontSize: '11px', color: 'var(--status-normal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> Acknowledged
                    </span>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
