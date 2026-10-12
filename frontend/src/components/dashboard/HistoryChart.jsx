import React, { useMemo } from 'react';

export const HistoryChart = ({ title, readings = [], unit = '°C', color = '#38bdf8' }) => {
  const { points, areaPoints, minVal, maxVal, currentVal } = useMemo(() => {
    if (!readings || readings.length === 0) {
      return { points: '', areaPoints: '', minVal: 0, maxVal: 0, currentVal: 0 };
    }

    const values = readings.map(r => r.value);
    const min = Math.floor(Math.min(...values) - 1);
    const max = Math.ceil(Math.max(...values) + 1);
    const range = Math.max(1, max - min);

    const width = 300;
    const height = 110;

    const coords = readings.map((r, i) => {
      const x = (i / (readings.length - 1 || 1)) * width;
      const y = height - ((r.value - min) / range) * (height - 20) - 10;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pts = coords.join(' ');
    const areaPts = `0,${height} ${pts} ${width},${height}`;

    return {
      points: pts,
      areaPoints: areaPts,
      minVal: min,
      maxVal: max,
      currentVal: values[values.length - 1]
    };
  }, [readings]);

  if (!readings || readings.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '16px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Gathering telemetry history...</span>
      </div>
    );
  }

  const gradientId = `grad-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="glass-panel" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>{title}</h4>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: 'var(--font-mono)' }}>
          {currentVal} {unit}
        </div>
      </div>

      <div style={{ width: '100%', height: '110px' }}>
        <svg viewBox="0 0 300 110" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

          {/* Area Fill */}
          <polygon points={areaPoints} fill={`url(#${gradientId})`} />

          {/* Line Stroke */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
        <span>24h ago ({minVal}{unit})</span>
        <span>Telemetry Trend</span>
        <span>Now ({maxVal}{unit})</span>
      </div>
    </div>
  );
};
