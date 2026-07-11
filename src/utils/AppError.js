/**
 * Classe d'erreur personnalisée pour l'API
 *
 * Permet une gestion unifiée des erreurs métier
 *
 * Utilisation:
 * throw new AppError('Email déjà utilisé', 409);
 * throw new AppError('Utilisateur non trouvé', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Erreur attendue (pas un bug)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
