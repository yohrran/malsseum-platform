const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, error: messages.join(', ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: 'Duplicate entry' });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ success: false, error: message });
};

module.exports = { errorHandler };
