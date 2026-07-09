const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/security');
const AppError = require('../utils/AppError');

/**
 * Authentifie via JWT sans toucher la base de données.
 * Le payload contient { id, role, isActive } signé — on fait confiance à la signature.
 * Fenêtre de risque max si un compte est désactivé = durée du token (JWT_EXPIRES_IN, défaut 1h).
 */
const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization;
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
    return next(new AppError('Compte désactivé. Contactez le support.', 403));
  }

  req.user = { id: decoded.id, role: decoded.role, isActive: decoded.isActive };
  next();
};

module.exports = authMiddleware;
