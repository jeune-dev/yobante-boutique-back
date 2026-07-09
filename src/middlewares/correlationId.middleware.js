const { randomUUID } = require('crypto');

/**
 * Attache un identifiant unique à chaque requête (X-Request-ID).
 * Propagé dans les logs pour tracer une requête de bout en bout.
 */
const correlationId = (req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

module.exports = correlationId;
