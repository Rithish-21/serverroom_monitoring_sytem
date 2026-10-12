import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';
import { evaluateReading } from '../services/alertService.js';
import { getSocketIO } from '../sockets/socketManager.js';

export const getAllSensors = async (req, res, next) => {
  try {
    const sql = `
      SELECT s.*, r.name AS rack_name,
        (SELECT value FROM sensor_readings WHERE sensor_id = s.id ORDER BY recorded_at DESC LIMIT 1) AS current_value,
        (SELECT recorded_at FROM sensor_readings WHERE sensor_id = s.id ORDER BY recorded_at DESC LIMIT 1) AS last_updated
      FROM sensors s
      LEFT JOIN racks r ON s.rack_id = r.id
      ORDER BY s.id ASC
    `;
    const sensors = await query(sql);

    const enriched = (sensors || []).map(sensor => {
      let status = 'normal';
      const val = sensor.current_value;
      if (val !== null && val !== undefined) {
        if (sensor.type === 'smoke' || sensor.type === 'water_leak') {
          if (val >= sensor.warning_limit) status = 'critical';
        } else {
          if (val >= sensor.critical_limit) status = 'critical';
          else if (val >= sensor.warning_limit) status = 'warning';
        }
      }
      return { ...sensor, status };
    });

    return sendSuccess(res, enriched, 'Sensors retrieved.');
  } catch (err) {
    next(err);
  }
};

export const getSensorHistory = async (req, res, next) => {
  try {
    const sensorId = Number(req.params.id);
    const sql = `SELECT id, value, recorded_at FROM sensor_readings WHERE sensor_id = ? ORDER BY recorded_at DESC LIMIT 30`;
    const rows = await query(sql, [sensorId]);
    return sendSuccess(res, (rows || []).reverse(), 'Sensor history retrieved.');
  } catch (err) {
    next(err);
  }
};

export const createSensor = async (req, res, next) => {
  try {
    const { rack_id, type, label, unit, warning_limit, critical_limit } = req.body;
    if (!type || !label || !unit || warning_limit === undefined || critical_limit === undefined) {
      return sendError(res, 'All sensor fields are required.', 400);
    }
    const result = await query(
      'INSERT INTO sensors (rack_id, type, label, unit, warning_limit, critical_limit) VALUES (?, ?, ?, ?, ?, ?)',
      [rack_id || null, type, label, unit, Number(warning_limit), Number(critical_limit)]
    );
    const newSensor = { id: result.insertId, rack_id: rack_id || null, type, label, unit, warning_limit: Number(warning_limit), critical_limit: Number(critical_limit), status: 'normal', current_value: 0 };
    const io = getSocketIO();
    if (io) io.emit('sensor:config_change', { action: 'created', sensor: newSensor });
    return sendSuccess(res, newSensor, 'Sensor created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateSensor = async (req, res, next) => {
  try {
    const sensorId = Number(req.params.id);
    const { warning_limit, critical_limit } = req.body;
    await query('UPDATE sensors SET warning_limit = ?, critical_limit = ? WHERE id = ?', [Number(warning_limit), Number(critical_limit), sensorId]);
    const io = getSocketIO();
    if (io) io.emit('sensor:config_change', { action: 'updated', sensorId, warning_limit, critical_limit });
    return sendSuccess(res, { id: sensorId, warning_limit, critical_limit }, 'Sensor updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const deleteSensor = async (req, res, next) => {
  try {
    const sensorId = Number(req.params.id);
    await query('DELETE FROM sensors WHERE id = ?', [sensorId]);
    const io = getSocketIO();
    if (io) io.emit('sensor:config_change', { action: 'deleted', sensorId });
    return sendSuccess(res, { id: sensorId }, 'Sensor deleted successfully.');
  } catch (err) {
    next(err);
  }
};

export const recordReading = async (req, res, next) => {
  try {
    const { sensor_id, value } = req.body;
    if (!sensor_id || value === undefined) return sendError(res, 'sensor_id and value are required.', 400);

    const sensorRows = await query('SELECT * FROM sensors WHERE id = ?', [sensor_id]);
    if (!sensorRows || sensorRows.length === 0) return sendError(res, 'Sensor not found.', 404);

    const sensor = sensorRows[0];
    await query('INSERT INTO sensor_readings (sensor_id, value, recorded_at) VALUES (?, ?, NOW())', [sensor_id, Number(value)]);

    const recentReadings = await query('SELECT value, recorded_at FROM sensor_readings WHERE sensor_id = ? ORDER BY recorded_at DESC LIMIT 5', [sensor_id]);
    const alerts = await evaluateReading(sensor, Number(value), recentReadings);
    return sendSuccess(res, { sensor_id, value, alerts }, 'Reading recorded.');
  } catch (err) {
    next(err);
  }
};

export const simulateEvent = async (req, res, next) => {
  try {
    const { event } = req.body;
    const sensors = await query('SELECT * FROM sensors');
    const updates = [];

    for (const s of sensors) {
      let targetVal = null;
      if (event === 'thermal_spike' && s.type === 'temperature') targetVal = 34.8;
      else if (event === 'water_leak' && s.type === 'water_leak') targetVal = 1.0;
      else if (event === 'smoke_alarm' && s.type === 'smoke') targetVal = 1.0;
      else if (event === 'reset') {
        if (s.type === 'temperature') targetVal = 22.5;
        else if (s.type === 'humidity') targetVal = 48.0;
        else if (s.type === 'airflow') targetVal = 3.2;
        else if (s.type === 'power') targetVal = 3.5;
        else targetVal = 0.0;
      }

      if (targetVal !== null) {
        await query('INSERT INTO sensor_readings (sensor_id, value, recorded_at) VALUES (?, ?, NOW())', [s.id, targetVal]);
        await evaluateReading(s, targetVal, [{ value: targetVal, recorded_at: new Date() }]);
        updates.push({ id: s.id, type: s.type, value: targetVal, status: targetVal >= s.critical_limit ? 'critical' : targetVal >= s.warning_limit ? 'warning' : 'normal' });
      }
    }

    const io = getSocketIO();
    if (io) io.emit('sensor:update', updates);
    return sendSuccess(res, { event, updates }, `Event '${event}' simulated successfully.`);
  } catch (err) {
    next(err);
  }
};
