import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';
import { getSocketIO } from '../sockets/socketManager.js';

export const getActiveAlerts = async (req, res, next) => {
  try {
    const sql = `
      SELECT a.*, s.label AS sensor_label, s.type AS sensor_type, u.full_name AS ack_by_name
      FROM alerts a
      LEFT JOIN sensors s ON a.sensor_id = s.id
      LEFT JOIN users u ON a.acknowledged_by = u.id
      WHERE a.is_acknowledged = 0
      ORDER BY a.created_at DESC
      LIMIT 50
    `;
    const alerts = await query(sql);
    return sendSuccess(res, alerts, 'Active alerts retrieved.');
  } catch (err) {
    next(err);
  }
};

export const getAllAlerts = async (req, res, next) => {
  try {
    const sql = `
      SELECT a.*, s.label AS sensor_label, s.type AS sensor_type, u.full_name AS ack_by_name
      FROM alerts a
      LEFT JOIN sensors s ON a.sensor_id = s.id
      LEFT JOIN users u ON a.acknowledged_by = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `;
    const alerts = await query(sql);
    return sendSuccess(res, alerts, 'All alerts retrieved.');
  } catch (err) {
    next(err);
  }
};

export const acknowledgeAlert = async (req, res, next) => {
  try {
    const alertId = Number(req.params.id);
    const userId = req.user.id;

    await query(
      'UPDATE alerts SET is_acknowledged = 1, acknowledged_by = ? WHERE id = ?',
      [userId, alertId]
    );

    const io = getSocketIO();
    if (io) {
      io.emit('alert:acknowledged', {
        alertId,
        acknowledgedBy: userId,
        acknowledgedByName: req.user.full_name
      });
    }

    return sendSuccess(res, { alertId, isAcknowledged: true }, 'Alert acknowledged.');
  } catch (err) {
    next(err);
  }
};
