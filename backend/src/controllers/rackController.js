import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const getAllRacks = async (req, res, next) => {
  try {
    const racks = await query('SELECT * FROM racks ORDER BY id ASC');
    return sendSuccess(res, racks, 'Racks retrieved.');
  } catch (err) {
    next(err);
  }
};

export const createRack = async (req, res, next) => {
  try {
    const { name, position_x = 0, position_y = 0, position_z = 0 } = req.body;
    if (!name) {
      return sendError(res, 'Rack name is required.', 400);
    }

    const result = await query(
      'INSERT INTO racks (name, position_x, position_y, position_z) VALUES (?, ?, ?, ?)',
      [name, Number(position_x), Number(position_y), Number(position_z)]
    );

    return sendSuccess(
      res,
      { id: result.insertId, name, position_x, position_y, position_z },
      'Rack created successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const deleteRack = async (req, res, next) => {
  try {
    const rackId = Number(req.params.id);
    await query('DELETE FROM racks WHERE id = ?', [rackId]);
    return sendSuccess(res, { id: rackId }, 'Rack deleted successfully.');
  } catch (err) {
    next(err);
  }
};
