import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Flame,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const GaugeCard = ({ title, value, unit, min = 0, max = 100, warningLimit, criticalLimit, type }) => {
  const isAlarmType = type === 'smoke' || type === 'water_leak';
  const isTriggered = isAlarmType && value >= 0.5;

  let status = 'normal';
  if (isAlarmType) {
    status = isTriggered ? 'critical' : 'normal';
  } else if (value >= criticalLimit) {
    status = 'critical';
  } else if (value >= warningLimit) {
    status = 'warning';
  }

  const statusColor = status === 'critical'
    ? 'var(--status-critical)'
    : status === 'warning'
      ? 'var(--status-warning)'
      : 'var(--status-normal)';

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const getIcon = () => {
    switch (type) {
      case 'temperature': return <Thermometer size={18} color={statusColor} />;
      case 'humidity': return <Droplets size={18} color={statusColor} />;
      case 'airflow': return <Wind size={18} color={statusColor} />;
      case 'power': return <Zap size={18} color={statusColor} />;
      case 'smoke': return <Flame size={18} color={statusColor} />;
      default: return <ShieldCheck size={18} color={statusColor} />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getIcon()}
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>{title}</span>
        </div>
        <span className={`badge badge-${status}`}>{status}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
          {isAlarmType ? (isTriggered ? 'DETECTED' : 'CLEAR') : value !== undefined && value !== null ? value : '--'}
        </span>
        {!isAlarmType && (
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{unit}</span>
        )}
      </div>

      {!isAlarmType && (
        <div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
                transition: 'width 0.4s ease'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
            <span>{min}{unit}</span>
            <span>Warn: {warningLimit}{unit}</span>
            <span>Crit: {criticalLimit}{unit}</span>
            <span>{max}{unit}</span>
          </div>
        </div>
      )}
    </div>
  );
};
