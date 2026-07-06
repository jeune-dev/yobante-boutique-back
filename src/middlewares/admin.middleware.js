// ─────────────────────────────────────────────────────────────
// middlewares/admin.middleware.js
// ─────────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/security');
const { User } = require('../models');

const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Votre compte est inactif. Accès refusé.' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé. Réservé aux administrateurs.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = adminMiddleware;
