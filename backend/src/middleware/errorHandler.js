const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle PostgreSQL unique constraint errors
  if (err.code === '23505') {
    if (err.constraint === 'users_email_key') {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    if (err.constraint === 'stores_email_key') {
      return res.status(409).json({ error: 'A store with this email already exists.' });
    }
    if (err.constraint.includes('ratings')) {
      return res.status(409).json({ error: 'You have already rated this store.' });
    }
    return res.status(409).json({ error: 'Duplicate entry. Record already exists.' });
  }

  // Handle PostgreSQL foreign key violations
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record not found.' });
  }

  // Handle PostgreSQL check constraint errors
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Invalid data. Check your input values.' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
