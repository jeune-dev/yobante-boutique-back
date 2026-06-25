const { error } = require('../utils/formatResponse');

function admin(req, res, next) {
  if (!req.user) {
    return error(res, 'Accès refusé', 403);
  }

  if (req.user.role !== 'admin') {
    return error(res, 'Accès refusé', 403);
  }

  next();
}

module.exports = { admin };
