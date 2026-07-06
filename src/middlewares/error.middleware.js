const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');

const CHAMPS_SENSIBLES = ['password', 'oldPassword', 'newPassword', 'token', 'refreshToken', 'code', 'otp'];

/** Retourne une copie du body avec les champs sensibles masqués, pour ne jamais les écrire dans les logs. */
function redactBody(body) {
  if (!body || typeof body !== 'object') return body;
  const clean = { ...body };
  for (const champ of CHAMPS_SENSIBLES) {
    if (champ in clean) clean[champ] = '[REDACTED]';
  }
  return clean;
}

/**
 * Global Error Handler Middleware
 * 
 * Gère tous les types d'erreurs:
 * - AppError (erreurs métier)
 * - Joi ValidationError
 * - Sequelize errors
 * - Erreurs non capturées
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur serveur interne';

  // Log l'erreur
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, { 
      path: req.path,
      method: req.method,
      stack: err.stack,
      body: redactBody(req.body)
    });
  } else {
    logger.warn(`[${statusCode}] ${message}`, { 
      path: req.path,
      method: req.method
    });
  }

  // ── Erreurs Joi (validation) ───────────────────────────────
  if (err.isJoi || (err.details && Array.isArray(err.details))) {
    const errors = (err.details || []).map(detail => ({
      field: detail.path?.join('.') || 'unknown',
      message: detail.message
    }));
    return ApiResponse.badRequest(res, 'Données invalides', errors);
  }

  // ── Erreurs de validation génériques (ex: express-validator, mongoose) ──
  if (err.name === 'ValidationError') {
    return ApiResponse.badRequest(res, 'Données invalides', err.errors);
  }

  // ── Erreurs JWT ────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Token invalide');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expiré');
  }

  if (err.name === 'UnauthorizedError') {
    return ApiResponse.unauthorized(res, err.message || 'Non autorisé');
  }

  // ── Erreurs Sequelize ──────────────────────────────────────
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'unknown';
    return ApiResponse.conflict(res, `${field} est déjà utilisé`);
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = (err.errors || []).map(e => ({
      field: e.path,
      message: e.message
    }));
    return ApiResponse.badRequest(res, 'Validation base de données échouée', errors);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ApiResponse.badRequest(res, 'Référence invalide vers une ressource');
  }

  // ── AppError (erreurs métier attendues) ───────────────────
  if (err instanceof AppError) {
    return ApiResponse.error(err.statusCode, res, err.message);
  }

  // ── Erreur générique (statusCode/status personnalisé, ou 500 par défaut) ──
  // Ne jamais exposer le détail d'une erreur 500 en production.
  const responseMessage = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'Erreur serveur interne'
    : message;

  return ApiResponse.error(statusCode, res, responseMessage);
};

module.exports = errorMiddleware;
