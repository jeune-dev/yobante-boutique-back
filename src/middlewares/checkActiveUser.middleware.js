// ─────────────────────────────────────────────────────────────
// middlewares/checkActiveUser.middleware.js
// ─────────────────────────────────────────────────────────────
const checkActiveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }

  if (!req.user.isActive) {
    return res.status(403).json({ message: 'Votre compte a été désactivé. Veuillez contacter le support.' });
  }

  next();
};

module.exports = checkActiveUser;
