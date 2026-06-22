const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/security');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['motDePasse', 'tokenRafraichissement', 'tokenReinitialisation', 'expirationReinitialisation'] },
    });
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = { authenticate };
