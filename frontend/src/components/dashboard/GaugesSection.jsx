import React from 'react';
import { GaugeCard } from './GaugeCard.jsx';
import { PueGaugeCard } from './PueGaugeCard.jsx';

export const GaugesSection = ({ sensors = [] }) => {
  const tempSensor = sensors.find((s) => s.type === 'temperature') || { current_value: 23.4, warning_limit: 27, critical_limit: 32 };
  const humiditySensor = sensors.find((s) => s.type === 'humidity') || { current_value: 48, warning_limit: 60, critical_limit: 75 };
  const airflowSensor = sensors.find((s) => s.type === 'airflow') || { current_value: 3.2, warning_limit: 2.0, critical_limit: 1.2 };
  const powerSensors = sensors.filter((s) => s.type === 'power');
  const powerSensor = powerSensors[0] || { current_value: 3.6, warning_limit: 4.5, critical_limit: 5.5 };
  const smokeSensor = sensors.find((s) => s.type === 'smoke') || { current_value: 0 };
  const waterSensor = sensors.find((s) => s.type === 'water_leak') || { current_value: 0 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
      <GaugeCard title="Avg Intake Temp" value={tempSensor.current_value} unit="°C" min={15} max={40} warningLimit={tempSensor.warning_limit} criticalLimit={tempSensor.critical_limit} type="temperature" />
      <GaugeCard title="Relative Humidity" value={humiditySensor.current_value} unit="%" min={20} max={90} warningLimit={humiditySensor.warning_limit} criticalLimit={humiditySensor.critical_limit} type="humidity" />
      <GaugeCard title="Plenum Airflow" value={airflowSensor.current_value} unit="m/s" min={0} max={5} warningLimit={airflowSensor.warning_limit} criticalLimit={airflowSensor.critical_limit} type="airflow" />
      <GaugeCard title="Power Load" value={powerSensor.current_value} unit="kW" min={1} max={7} warningLimit={powerSensor.warning_limit} criticalLimit={powerSensor.critical_limit} type="power" />
      <PueGaugeCard powerSensors={powerSensors} />
      <GaugeCard title="Water Leak" value={waterSensor.current_value} unit="status" type="water_leak" />
      <GaugeCard title="Smoke Alarm" value={smokeSensor.current_value} unit="status" type="smoke" />
    </div>
  );
};
