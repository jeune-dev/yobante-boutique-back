const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/security');
const { AppError } = require('../errors/AppError');
const { ROLES } = require('../constants');

/**
 * Authentifie ET vérifie le rôle ADMIN depuis le payload JWT — aucune requête DB.
 */
const adminMiddleware = (_req, _res, next) => {
  const authHeader = _req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token manquant ou invalide', 401));
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') return next(new AppError('Token expiré', 401));
    return next(new AppError('Token invalide', 401));
  }

  if (!decoded.isActive) {
    return next(new AppError('Votre compte est inactif. Accès refusé.', 403));
  }

  if (decoded.role !== ROLES.ADMIN) {
    return next(new AppError('Accès refusé. Réservé aux administrateurs.', 403));
  }

  _req.user = { id: decoded.id, role: decoded.role, isActive: decoded.isActive };
  next();
};

module.exports = adminMiddleware;
