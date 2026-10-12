import { sendError } from '../utils/responseUtils.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[GlobalErrorHandler]', err.stack || err.message);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, status);
};
