const logger = require('../config/logger');
const ApiResponse = require('./ApiResponse');

/**
 * Wrapper pour capturer les erreurs async des routes
 * 
 * Utilisation:
 * router.post('/register', asyncHandler(controller.register));
 * 
 * Avantage: Élimine le try-catch boilerplate dans chaque controller
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      logger.error('Erreur non gérée dans handler', { 
        error: err.message, 
        path: req.path,
        method: req.method,
        stack: err.stack 
      });

      // Gestion des erreurs spécifiques
      if (err.name === 'ValidationError') {
        return ApiResponse.badRequest(res, 'Données invalides', err.errors);
      }

      if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0].path;
        return ApiResponse.conflict(res, `${field} est déjà utilisé`);
      }

      if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
        return ApiResponse.badRequest(res, 'Validation échouée', errors);
      }

      if (err.statusCode) {
        return ApiResponse.error(err.statusCode, res, err.message);
      }

      // Erreur générique
      ApiResponse.internalServerError(res, 'Erreur serveur interne');
    });
  };
};

module.exports = asyncHandler;
