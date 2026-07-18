const authMiddleware = require('./auth.middleware');
const { AppError } = require('../errors/AppError');
const { ROLES } = require('../constants');
const { ProfilVendeur } = require('../models');

const vendeurMiddleware = (req, res, next) => {
  authMiddleware(req, res, async (err) => {
    if (err) return next(err);

    if (req.user.role !== ROLES.VENDEUR && req.user.role !== ROLES.ADMIN) {
      return next(new AppError('Accès réservé aux vendeurs', 403));
    }

    if (req.user.role === ROLES.VENDEUR) {
      const profil = await ProfilVendeur.findOne({
        where: { userId: req.user.id, isActive: true },
        attributes: [
          'id',
          'userId',
          'nomBoutique',
          'isValidatedStep1',
          'isValidatedStep2',
          'isActive',
        ],
      });
      if (!profil) {
        return next(
          new AppError(
            "Votre compte vendeur n'est pas encore validé. Contactez l'administration.",
            403
          )
        );
      }
      req.profilVendeur = profil;
    }

    next();
  });
};

module.exports = vendeurMiddleware;
