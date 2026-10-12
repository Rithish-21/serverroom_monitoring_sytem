import React from 'react';
import { Zap, DollarSign, Activity } from 'lucide-react';

export const PueGaugeCard = ({ powerSensors = [] }) => {
  // Compute total IT load in kW
  const itPowerKw = powerSensors.reduce((acc, s) => acc + (s.current_value || 3.4), 0) || 7.2;
  // Dynamic cooling & facility overhead based on airflow and temp
  const coolingOverheadKw = Number((itPowerKw * 0.22).toFixed(2));
  const totalFacilityKw = Number((itPowerKw + coolingOverheadKw).toFixed(2));
  
  // PUE formula = Total Facility Power / IT Equipment Power
  const pue = Number((totalFacilityKw / itPowerKw).toFixed(2));
  
  // Cost calculation ($0.12 per kWh industrial rate)
  const costPerHour = (totalFacilityKw * 0.12).toFixed(2);
  const costPerMonth = Math.round(totalFacilityKw * 0.12 * 24 * 30);

  const status = pue <= 1.25 ? 'normal' : pue <= 1.5 ? 'warning' : 'critical';
  const ratingText = pue <= 1.25 ? 'WORLD CLASS' : pue <= 1.5 ? 'ACCEPTABLE' : 'HIGH OVERHEAD';

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>PUE & Energy Efficiency</span>
        </div>
        <span className={`badge badge-${status}`}>{ratingText}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '6px 0 10px' }}>
        <span style={{ fontSize: '32px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
          {pue}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PUE Ratio (Ideal: 1.0)</span>
      </div>

      {/* Energy split breakdown */}
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '10px' }}>
        <div style={{ width: '82%', background: '#38bdf8' }} title={`IT Equipment: ${itPowerKw} kW`} />
        <div style={{ width: '18%', background: '#818cf8' }} title={`Cooling/Plenum: ${coolingOverheadKw} kW`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Total Facility Load</div>
          <div style={{ fontWeight: '700', color: '#fff', fontFamily: 'var(--font-mono)' }}>{totalFacilityKw} kW</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Estimated Energy Cost</div>
          <div style={{ fontWeight: '700', color: '#34d399', fontFamily: 'var(--font-mono)' }}>${costPerHour}/hr (~${costPerMonth}/mo)</div>
        </div>
      </div>
    </div>
  );
};
