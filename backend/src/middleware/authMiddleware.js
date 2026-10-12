import { verifyToken } from '../utils/jwtUtils.js';
import { query } from '../config/db.js';
import { sendError } from '../utils/responseUtils.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No authentication token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return sendError(res, 'Invalid or expired authentication token.', 401);
  }

  try {
    const users = await query(
      'SELECT id, full_name, email, phone, role, is_email_verified, is_phone_verified FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!users || users.length === 0) {
      return sendError(res, 'User associated with this token no longer exists.', 401);
    }

    req.user = users[0];
    next();
  } catch (err) {
    return sendError(res, 'Authentication verification error.', 500, err.message);
  }
};
