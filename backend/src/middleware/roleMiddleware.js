import { sendError } from '../utils/responseUtils.js';

export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (req.user.role !== requiredRole) {
      return sendError(
        res,
        `Forbidden. Access requires ${requiredRole.toUpperCase()} privileges.`,
        403
      );
    }

    next();
  };
};
