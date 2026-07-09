const logger = require('../config/logger');

const SKIP_PATHS = new Set(['/health', '/favicon.ico']);

/**
 * Log structuré de chaque requête HTTP : méthode, chemin, statut, durée, requestId.
 * Utilisable par Grafana / ELK / Loki pour le monitoring.
 */
const requestLogger = (req, res, next) => {
  if (SKIP_PATHS.has(req.path)) return next();

  const startAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1e6;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]('HTTP', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${durationMs.toFixed(2)}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    });
  });

  next();
};

module.exports = requestLogger;
