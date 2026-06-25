const logger = require('../utils/logger');
const { error } = require('../utils/formatResponse');

function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  let message = err.message || 'Erreur interne du serveur';
  let errors = null;

  if (err.isJoi || err.name === 'ValidationError') {
    message = 'Données invalides';
    errors = err.details ? err.details.map((detail) => detail.message) : [err.message];
  } else if (err.name === 'UnauthorizedError' || status === 401) {
    message = err.message || 'Non autorisé';
  } else if (status === 403) {
    message = err.message || 'Accès refusé';
  } else if (status === 404) {
    message = err.message || 'Ressource non trouvée';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    message = 'Conflit de données';
    errors = err.errors ? err.errors.map((e) => e.message) : null;
  }

  logger.error({ message, errors, stack: err.stack });

  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Erreur interne du serveur';
  }

  return error(res, message, status, errors);
}

module.exports = errorMiddleware;
