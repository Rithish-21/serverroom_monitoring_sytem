import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await query(
      'SELECT id, full_name, email, phone, role, is_email_verified, is_phone_verified, created_at FROM users ORDER BY id ASC'
    );
    return sendSuccess(res, users, 'Users retrieved.');
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const { role, is_email_verified, is_phone_verified } = req.body;

    if (userId === req.user.id && role && role !== 'admin') {
      return sendError(res, 'Cannot demote your own admin account.', 400);
    }

    if (role && !['admin', 'user'].includes(role)) {
      return sendError(res, 'Role must be either "admin" or "user".', 400);
    }

    if (role) {
      await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    }
    if (is_email_verified !== undefined) {
      await query('UPDATE users SET is_email_verified = ? WHERE id = ?', [is_email_verified ? 1 : 0, userId]);
    }
    if (is_phone_verified !== undefined) {
      await query('UPDATE users SET is_phone_verified = ? WHERE id = ?', [is_phone_verified ? 1 : 0, userId]);
    }

    const updated = await query(
      'SELECT id, full_name, email, phone, role, is_email_verified, is_phone_verified FROM users WHERE id = ?',
      [userId]
    );

    return sendSuccess(res, updated[0], 'User updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (userId === req.user.id) {
      return sendError(res, 'Cannot delete your own admin account.', 400);
    }

    await query('DELETE FROM users WHERE id = ?', [userId]);
    return sendSuccess(res, { id: userId }, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
};
