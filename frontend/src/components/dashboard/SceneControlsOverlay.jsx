import React from 'react';
import { Eye, Flame, Camera } from 'lucide-react';

export const SceneControlsOverlay = ({
  thermalMode,
  setThermalMode,
  cameraPreset,
  setCameraPreset
}) => {
  return (
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
      {/* Thermal Vision Toggle Button */}
      <button
        onClick={() => setThermalMode(!thermalMode)}
        className="btn"
        style={{
          padding: '6px 12px',
          fontSize: '12px',
          background: thermalMode ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(15, 23, 42, 0.85)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: thermalMode ? '0 0 15px rgba(245, 158, 11, 0.5)' : 'none'
        }}
      >
        <Flame size={14} /> {thermalMode ? 'Thermal Vision: ON' : 'Thermal Heatmap'}
      </button>

      {/* Camera Presets Selector */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.85)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <button
          onClick={() => setCameraPreset('overview')}
          style={{ padding: '4px 8px', fontSize: '11px', background: cameraPreset === 'overview' ? 'var(--primary)' : 'transparent', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Overview
        </button>
        <button
          onClick={() => setCameraPreset('aisleA')}
          style={{ padding: '4px 8px', fontSize: '11px', background: cameraPreset === 'aisleA' ? 'var(--primary)' : 'transparent', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Aisle A
        </button>
        <button
          onClick={() => setCameraPreset('aisleB')}
          style={{ padding: '4px 8px', fontSize: '11px', background: cameraPreset === 'aisleB' ? 'var(--primary)' : 'transparent', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Aisle B
        </button>
        <button
          onClick={() => setCameraPreset('crac')}
          style={{ padding: '4px 8px', fontSize: '11px', background: cameraPreset === 'crac' ? 'var(--primary)' : 'transparent', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          CRAC HVAC
        </button>
        <button
          onClick={() => setCameraPreset('topDown')}
          style={{ padding: '4px 8px', fontSize: '11px', background: cameraPreset === 'topDown' ? 'var(--primary)' : 'transparent', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Top-Down
        </button>
      </div>

      {/* Thermal Heatmap Spectrum Legend */}
      {thermalMode && (
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '11px', width: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--text-muted)' }}>
            <span>18°C Cool</span>
            <span>26°C Safe</span>
            <span>34°C+ Hot</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #06b6d4, #10b981, #f59e0b, #ef4444)' }} />
        </div>
      )}
    </div>
  );
};
