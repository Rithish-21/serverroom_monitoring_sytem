import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export const HealthScoreCard = ({ sensors = [], alerts = [] }) => {
  // Calculate health score: 100 base, deductions for warnings (-10), criticals (-25)
  const criticalSensors = sensors.filter(s => s.status === 'critical').length;
  const warningSensors = sensors.filter(s => s.status === 'warning').length;
  const unackAlerts = alerts.filter(a => !a.is_acknowledged).length;

  let score = 100 - (criticalSensors * 25) - (warningSensors * 10) - (unackAlerts * 5);
  score = Math.max(15, Math.min(100, score));

  const tier = score >= 85 ? 'OPTIMAL' : score >= 60 ? 'DEGRADED' : 'CRITICAL';
  const color = score >= 85 ? 'var(--status-normal)' : score >= 60 ? 'var(--status-warning)' : 'var(--status-critical)';
  const glow = score >= 85 ? 'var(--status-normal-glow)' : score >= 60 ? 'var(--status-warning-glow)' : 'var(--status-critical-glow)';

  const Icon = score >= 85 ? ShieldCheck : score >= 60 ? AlertTriangle : ShieldAlert;

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3.2"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${glow})`, transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{score}%</span>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Icon size={18} color={color} />
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.05em', color }}>{tier} STATUS</span>
        </div>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>Overall Facility Health</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {criticalSensors > 0
            ? `${criticalSensors} critical sensor alerts require immediate response.`
            : warningSensors > 0
              ? `${warningSensors} warning conditions detected across racks.`
              : 'All datacenter environmental parameters within safe operating thresholds.'}
        </p>
      </div>
    </div>
  );
};
