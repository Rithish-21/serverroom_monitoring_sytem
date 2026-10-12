import { query } from '../config/db.js';
import { getSocketIO } from '../sockets/socketManager.js';

// Cache recent alerts to debounce frequent duplicate triggers
const recentAlertsCache = new Map();
const RECENT_ALERT_COOLDOWN_MS = 60 * 1000;

export const evaluateReading = async (sensor, currentValue, recentReadings = []) => {
  const alertsTriggered = [];
  const { id: sensorId, type, label, warning_limit, critical_limit } = sensor;

  // 1. Threshold Evaluation
  let thresholdLevel = null;
  let thresholdMessage = null;

  if (type === 'smoke' && currentValue >= warning_limit) {
    thresholdLevel = 'critical';
    thresholdMessage = `EMERGENCY: Smoke detected at ${label}! Fire suppression protocol initiated.`;
  } else if (type === 'water_leak' && currentValue >= warning_limit) {
    thresholdLevel = 'critical';
    thresholdMessage = `URGENT: Water leak detected at ${label}! Check raised floor plenum.`;
  } else if (currentValue >= critical_limit) {
    thresholdLevel = 'critical';
    thresholdMessage = `CRITICAL: ${label} value ${currentValue}${sensor.unit} exceeded critical limit of ${critical_limit}${sensor.unit}.`;
  } else if (currentValue >= warning_limit) {
    thresholdLevel = 'warning';
    thresholdMessage = `WARNING: ${label} value ${currentValue}${sensor.unit} reached warning limit of ${warning_limit}${sensor.unit}.`;
  }

  if (thresholdLevel) {
    const alert = await triggerAlert(sensorId, thresholdLevel, thresholdMessage);
    if (alert) alertsTriggered.push(alert);
  }

  // 2. Trend-Based Predictive Analysis (Flag fast rising temperature before crossing limit)
  if (type === 'temperature' && recentReadings.length >= 3 && !thresholdLevel) {
    const predictiveAlert = checkTemperatureTrend(sensor, currentValue, recentReadings);
    if (predictiveAlert) {
      const alert = await triggerAlert(sensorId, 'warning', predictiveAlert);
      if (alert) alertsTriggered.push(alert);
    }
  }

  return alertsTriggered;
};

// Trend slope calculation: delta Temp / delta time
const checkTemperatureTrend = (sensor, currentValue, readings) => {
  const sorted = [...readings].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  const oldest = sorted[0];
  const timeSpanMinutes = (Date.now() - new Date(oldest.recorded_at).getTime()) / 60000;

  if (timeSpanMinutes <= 0.2) return null;

  const tempDelta = currentValue - oldest.value;
  const ratePerMinute = tempDelta / timeSpanMinutes;

  // If rising at > 0.4°C / minute and will breach critical in < 15 minutes
  if (ratePerMinute > 0.4) {
    const minutesToCritical = (sensor.critical_limit - currentValue) / ratePerMinute;
    if (minutesToCritical > 0 && minutesToCritical <= 15) {
      return `PREDICTIVE TREND: ${sensor.label} is rising at +${ratePerMinute.toFixed(2)}°C/min. Projected to breach critical limit (${sensor.critical_limit}°C) in ~${Math.round(minutesToCritical)} minutes.`;
    }
  }
  return null;
};

export const triggerAlert = async (sensorId, level, message) => {
  const cacheKey = `${sensorId}:${level}`;
  const lastTime = recentAlertsCache.get(cacheKey);

  if (lastTime && Date.now() - lastTime < RECENT_ALERT_COOLDOWN_MS) {
    return null; // Suppress duplicate spam
  }

  recentAlertsCache.set(cacheKey, Date.now());

  const result = await query(
    'INSERT INTO alerts (sensor_id, level, message, is_acknowledged, created_at) VALUES (?, ?, ?, 0, NOW())',
    [sensorId, level, message]
  );

  const alertData = {
    id: result.insertId || Date.now(),
    sensor_id: sensorId,
    level,
    message,
    is_acknowledged: 0,
    created_at: new Date()
  };

  const io = getSocketIO();
  if (io) {
    io.emit('alert:new', alertData);
  }

  return alertData;
};
