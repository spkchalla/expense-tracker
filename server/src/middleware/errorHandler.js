import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const response = {
    success: false,
    error: err.isOperational || config.env !== 'production' ? err.message : 'An unexpected server error occurred',
  };

  if (err.details) {
    response.details = err.details;
  }

  if (config.env === 'development' || config.env === 'test') {
    if (statusCode === 500) {
      console.error('[Unhandled Error]', err);
    }
  }

  res.status(statusCode).json(response);
}
