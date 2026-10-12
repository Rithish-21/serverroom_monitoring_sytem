import { query, initDb } from '../src/config/db.js';
import { evaluateReading } from '../src/services/alertService.js';
import { getSocketIO, initSocket } from '../src/sockets/socketManager.js';
import { io as ioClient } from 'socket.io-client';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const UPDATE_INTERVAL_MS = 3500;

console.log('📡 Starting SentinelCore IoT Telemetry Simulator...');

// Base simulation state per sensor
const telemetryState = new Map();

const getRandomVariance = (min, max) => min + Math.random() * (max - min);

const generateSensorValue = (sensor, cycle) => {
  const { id, type } = sensor;
  let current = telemetryState.get(id);

  if (current === undefined) {
    if (type === 'temperature') current = 22.5 + (id % 3);
    else if (type === 'humidity') current = 48.0;
    else if (type === 'airflow') current = 3.2;
    else if (type === 'power') current = 3.5;
    else current = 0.0;
  }

  // Periodic simulated temperature rise on sensor #4 or #1 to demonstrate alert engine
  if (type === 'temperature') {
    if (cycle % 25 > 18 && id === 4) {
      // Simulating a rising thermal hotspot to demonstrate trend prediction & warning
      current += getRandomVariance(0.4, 0.7);
      if (current > 33) current = 25.0; // reset after peak
    } else {
      current += getRandomVariance(-0.25, 0.25);
      current = Math.max(18.0, Math.min(27.5, current));
    }
  } else if (type === 'humidity') {
    current += getRandomVariance(-0.5, 0.5);
    current = Math.max(35.0, Math.min(65.0, current));
  } else if (type === 'airflow') {
    current += getRandomVariance(-0.1, 0.1);
    current = Math.max(2.5, Math.min(4.0, current));
  } else if (type === 'power') {
    current += getRandomVariance(-0.08, 0.08);
    current = Math.max(2.5, Math.min(4.8, current));
  } else {
    // Binary alarms (smoke, water leak) stay 0 unless emergency cycle
    current = cycle === 50 && id === 8 ? 1.0 : 0.0;
  }

  const rounded = Number(current.toFixed(1));
  telemetryState.set(id, rounded);
  return rounded;
};

const runSimulationLoop = async () => {
  await initDb();
  let cycle = 0;

  // Connect socket client to push updates to the backend if running standalone
  const socket = ioClient(BACKEND_URL, { reconnection: true });

  socket.on('connect', () => {
    console.log(`[Simulator] Connected to backend gateway at ${BACKEND_URL}`);
  });

  const tick = async () => {
    cycle += 1;
    try {
      const sensors = await query('SELECT * FROM sensors');
      if (!sensors || sensors.length === 0) {
        console.log('[Simulator] No sensors defined in DB. Waiting...');
        return;
      }

      const updates = [];

      for (const sensor of sensors) {
        const val = generateSensorValue(sensor, cycle);

        // Insert into database
        await query(
          'INSERT INTO sensor_readings (sensor_id, value, recorded_at) VALUES (?, ?, NOW())',
          [sensor.id, val]
        );

        // Fetch recent readings for trend evaluation
        const recent = await query(
          'SELECT value, recorded_at FROM sensor_readings WHERE sensor_id = ? ORDER BY recorded_at DESC LIMIT 5',
          [sensor.id]
        );

        await evaluateReading(sensor, val, recent);

        updates.push({
          id: sensor.id,
          rack_id: sensor.rack_id,
          type: sensor.type,
          label: sensor.label,
          unit: sensor.unit,
          value: val,
          status: val >= sensor.critical_limit ? 'critical' : val >= sensor.warning_limit ? 'warning' : 'normal',
          timestamp: new Date().toISOString()
        });
      }

      console.log(`[Simulator] Tick #${cycle}: broadcasted ${updates.length} telemetry readings.`);
    } catch (err) {
      console.error('[Simulator] Tick error:', err.message);
    }
  };

  // Immediate first tick then interval
  await tick();
  setInterval(tick, UPDATE_INTERVAL_MS);
};

runSimulationLoop();
