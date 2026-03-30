export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // PostgreSQL-specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          error: 'Conflict',
          message: 'A record with this value already exists.',
          detail: err.detail || null,
        });
      case '23503': // foreign_key_violation
        return res.status(409).json({
          error: 'Conflict',
          message: 'Referenced record does not exist.',
          detail: err.detail || null,
        });
      case '23502': // not_null_violation
        return res.status(400).json({
          error: 'Bad Request',
          message: `Required field is missing: ${err.column || 'unknown'}`,
        });
      case '22P02': // invalid_text_representation
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid data format (e.g., malformed UUID).',
        });
      case '42P01': // undefined_table
        return res.status(500).json({
          error: 'Database Error',
          message: 'A database table is missing. Please run the schema migration.',
        });
      default:
        break;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(422).json({
      error: 'Validation Error',
      errors: err.errors,
    });
  }

  // Default 500
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An internal server error occurred.'
      : err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message,
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist.`,
  });
};
