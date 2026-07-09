const AppError = require('../utils/AppError');

const checkActiveUser = (req, _res, next) => {
  if (!req.user) return next(new AppError('Utilisateur non authentifié', 401));
  if (!req.user.isActive)
    return next(new AppError('Votre compte a été désactivé. Veuillez contacter le support.', 403));
  next();
};

module.exports = checkActiveUser;
