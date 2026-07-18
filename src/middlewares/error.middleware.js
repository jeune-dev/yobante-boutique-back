'use strict';
const { AppError } = require('../errors/AppError');
const logger = require('../config/logger');

const isProd = process.env.NODE_ENV === 'production';

const CHAMPS_SENSIBLES = [
  'password',
  'oldPassword',
  'newPassword',
  'token',
  'refreshToken',
  'code',
  'otp',
];
function redactBody(body) {
  if (!body || typeof body !== 'object') return body;
  const clean = { ...body };
  for (const champ of CHAMPS_SENSIBLES) {
    if (champ in clean) clean[champ] = '[REDACTED]';
  }
  return clean;
}

const errorMiddleware = (err, req, res, _next) => {
  logger.error(err.message, {
    name: err.name,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
    body: redactBody(req.body),
  });

  if (err instanceof AppError && err.isOperational) {
    const body = { success: false, message: err.message };
    if (err.details && err.details.length) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ success: false, message: 'Token expiré' });
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError')
    return res.status(401).json({ success: false, message: 'Token invalide' });

  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Fichier trop volumineux (max 5 MB)'
        : "Erreur lors de l'envoi du fichier";
    return res.status(400).json({ success: false, message });
  }

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError)
    return res.status(400).json({ success: false, message: 'Corps de requête JSON invalide' });

  if (err.status === 413 || err.type === 'entity.too.large')
    return res.status(413).json({ success: false, message: 'Corps de la requête trop volumineux' });

  if (err.name === 'SequelizeValidationError')
    return res.status(422).json({
      success: false,
      message: 'Données invalides',
      ...(isProd ? {} : { details: err.errors?.map((e) => e.message) }),
    });
  if (err.name === 'SequelizeUniqueConstraintError')
    return res.status(409).json({ success: false, message: 'Cette ressource existe déjà' });
  if (err.name === 'SequelizeForeignKeyConstraintError')
    return res
      .status(400)
      .json({ success: false, message: 'Référence invalide : ressource liée introuvable' });
  if (
    [
      'SequelizeConnectionError',
      'SequelizeConnectionRefusedError',
      'SequelizeConnectionTimedOutError',
      'SequelizeTimeoutError',
    ].includes(err.name)
  )
    return res.status(503).json({ success: false, message: 'Service temporairement indisponible' });

  const message = isProd ? 'Erreur interne du serveur' : err.message || 'Erreur interne du serveur';
  return res.status(500).json({ success: false, message });
};

module.exports = errorMiddleware;
