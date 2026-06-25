const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/security');
const { User } = require('../models');
const { error } = require('../utils/formatResponse');

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentification requise', 401);
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, jwtConfig.secret);
    } catch (err) {
      return error(res, 'Token invalide ou expiré', 401);
    }

    const user = await User.findByPk(payload.id);
    if (!user || !user.isActive) {
      return error(res, 'Utilisateur introuvable ou inactif', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { auth };
