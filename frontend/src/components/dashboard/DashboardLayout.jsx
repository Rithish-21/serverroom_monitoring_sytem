import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { socketService } from '../../services/socketService.js';
import { ServerRoomScene } from '../three/ServerRoomScene.jsx';
import { HealthScoreCard } from './HealthScoreCard.jsx';
import { GaugesSection } from './GaugesSection.jsx';
import { HistoryChart } from './HistoryChart.jsx';
import { AlertFeed } from './AlertFeed.jsx';
import { DetailsSidebar } from './DetailsSidebar.jsx';
import { AdminManagementModal } from './AdminManagementModal.jsx';
import { DashboardHeader } from './DashboardHeader.jsx';
import { SimulationToolbar } from './SimulationToolbar.jsx';
import { SceneControlsOverlay } from './SceneControlsOverlay.jsx';
import { playEmergencySiren, playAckChime } from '../../utils/audioAlarm.js';

export const DashboardLayout = ({ isAdmin = false }) => {
  const { user, logout } = useAuth();

  const [racks, setRacks] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [selectedRack, setSelectedRack] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  
  // 6 New Features State
  const [thermalMode, setThermalMode] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('overview');
  const [alarmMuted, setAlarmMuted] = useState(() => localStorage.getItem('sentinel_alarm_muted') === 'true');

  const hasCriticalAlarm = alerts.some((a) => !a.is_acknowledged && a.level === 'critical');

  const loadData = async () => {
    try {
      const [racksRes, sensorsRes, alertsRes] = await Promise.all([
        api.get('/racks'),
        api.get('/sensors'),
        api.get('/alerts')
      ]);
      setRacks(racksRes.data.data || []);
      setSensors(sensorsRes.data.data || []);
      setAlerts(alertsRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();

    const handleSensorUpdate = (telemetryList) => {
      if (Array.isArray(telemetryList)) {
        setSensors((prev) =>
          prev.map((s) => {
            const match = telemetryList.find((t) => t.id === s.id);
            return match ? { ...s, current_value: match.value, status: match.status } : s;
          })
        );
      }
    };

    const handleNewAlert = (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
      if (newAlert.level === 'critical' && !alarmMuted) {
        playEmergencySiren();
      }
    };

    const handleAlertAck = ({ alertId, acknowledgedBy, acknowledgedByName }) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_acknowledged: 1, acknowledged_by: acknowledgedBy, ack_by_name: acknowledgedByName } : a))
      );
      playAckChime();
    };

    socketService.on('sensor:update', handleSensorUpdate);
    socketService.on('alert:new', handleNewAlert);
    socketService.on('alert:acknowledged', handleAlertAck);

    return () => {
      socketService.off('sensor:update', handleSensorUpdate);
      socketService.off('alert:new', handleNewAlert);
      socketService.off('alert:acknowledged', handleAlertAck);
    };
  }, [alarmMuted]);

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_acknowledged: 1 } : a)));
      playAckChime();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#fff', display: 'flex', flexDirection: 'column', borderTop: hasCriticalAlarm ? '4px solid #ef4444' : 'none' }}>
      {/* Top Header */}
      <DashboardHeader
        user={user}
        isAdmin={isAdmin}
        alarmMuted={alarmMuted}
        setAlarmMuted={(val) => { setAlarmMuted(val); localStorage.setItem('sentinel_alarm_muted', val); }}
        onOpenSettings={() => setAdminModalOpen(true)}
        onLogout={logout}
        sensors={sensors}
        alerts={alerts}
      />

      <main style={{ flex: 1, padding: '20px 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Facility Health Score Banner */}
          <HealthScoreCard sensors={sensors} alerts={alerts} />

          {/* Emergency Drill & Simulator Toolbar */}
          <SimulationToolbar onSimulateSuccess={loadData} />

          {/* 3D Model with Camera Presets and Thermal Overlay */}
          <div className="glass-panel" style={{ height: '480px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'rgba(15,23,42,0.85)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Interactive 3D Digital Twin // Click Rack or Sensor to Inspect
            </div>
            
            <SceneControlsOverlay
              thermalMode={thermalMode}
              setThermalMode={setThermalMode}
              cameraPreset={cameraPreset}
              setCameraPreset={setCameraPreset}
            />

            <ServerRoomScene
              racks={racks}
              sensors={sensors}
              selectedRack={selectedRack}
              selectedSensor={selectedSensor}
              thermalMode={thermalMode}
              cameraPreset={cameraPreset}
              onSelectRack={(r) => { setSelectedRack(r); setSelectedSensor(null); }}
              onSelectSensor={(s) => { setSelectedSensor(s); setSelectedRack(null); }}
            />

            <DetailsSidebar
              selectedRack={selectedRack}
              selectedSensor={selectedSensor}
              allSensors={sensors}
              onClose={() => { setSelectedRack(null); setSelectedSensor(null); }}
              onSelectSensor={(s) => setSelectedSensor(s)}
            />
          </div>

          {/* Telemetry Gauges + PUE Efficiency Card */}
          <GaugesSection sensors={sensors} />
        </div>

        {/* Live Incident Feed & 24h Thermal Trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AlertFeed alerts={alerts} onAcknowledge={handleAcknowledge} />
          <HistoryChart title="Thermal Gradient Trend (24h)" readings={[{ value: 22.4 }, { value: 23.1 }, { value: 23.8 }, { value: 24.2 }, { value: 24.9 }, { value: sensors.find(s => s.type === 'temperature')?.current_value || 25.4 }]} unit="°C" />
        </div>
      </main>

      {isAdmin && (
        <AdminManagementModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          onRefreshData={loadData}
          racks={racks}
          sensors={sensors}
        />
      )}
    </div>
  );
};
