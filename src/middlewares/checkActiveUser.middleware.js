const checkActiveUser = (req, res, next) => {
  if (!req.user?.estActif) {
    return res.status(403).json({ message: 'Votre compte est désactivé. Contactez un administrateur.' });
  }
  next();
};

module.exports = { checkActiveUser };
