const DOMAIN_CODES = new Set([
  'EMAIL_ALREADY_EXISTS',
  'INVALID_CREDENTIALS',
  'UNAUTHORIZED',
  'VALIDATION_ERROR',
  'TODO_NOT_FOUND',
]);

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      code: DOMAIN_CODES.has(err.code) ? err.code : 'INTERNAL_ERROR',
      message: statusCode >= 500 ? 'Internal server error' : err.message,
    },
  });
}
