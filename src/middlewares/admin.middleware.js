const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  next();
};

const isVendeur = (req, res, next) => {
  if (!['admin', 'vendeur'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Accès réservé aux vendeurs' });
  }
  next();
};

module.exports = { isAdmin, isVendeur };
