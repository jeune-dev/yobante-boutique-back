/**
 * Classe utilitaire pour formater les réponses API
 * 
 * Pattern uniforme: { success, message, data?, timestamp, path? }
 * Permet une gestion cohérente des erreurs et des succès
 */

class ApiResponse {
  /**
   * Succès avec données
   * @param {number} statusCode - Code HTTP
   * @param {object} res - Objet Response Express
   * @param {string} message - Message utilisateur
   * @param {*} data - Données à retourner
   */
  static success(statusCode, res, message, data = null) {
    const response = {
      success: true,
      message,
      ...(data && { data })
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Erreur
   * @param {number} statusCode - Code HTTP
   * @param {object} res - Objet Response Express
   * @param {string} message - Message d'erreur utilisateur
   * @param {object} errors - Détails erreur optionnels (validation, etc)
   */
  static error(statusCode, res, message, errors = null) {
    const response = {
      success: false,
      message,
      ...(errors && { errors })
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Erreur 400 - Requête invalide
   */
  static badRequest(res, message, errors = null) {
    return this.error(400, res, message, errors);
  }

  /**
   * Erreur 401 - Non authentifié
   */
  static unauthorized(res, message = 'Non authentifié') {
    return this.error(401, res, message);
  }

  /**
   * Erreur 403 - Non autorisé
   */
  static forbidden(res, message = 'Accès refusé') {
    return this.error(403, res, message);
  }

  /**
   * Erreur 404 - Non trouvé
   */
  static notFound(res, message = 'Ressource introuvable') {
    return this.error(404, res, message);
  }

  /**
   * Erreur 409 - Conflit
   */
  static conflict(res, message) {
    return this.error(409, res, message);
  }

  /**
   * Erreur 429 - Trop de requêtes
   */
  static tooManyRequests(res, message = 'Trop de requêtes. Veuillez réessayer plus tard.') {
    return this.error(429, res, message);
  }

  /**
   * Erreur 500 - Serveur interne
   */
  static internalServerError(res, message = 'Erreur serveur interne') {
    return this.error(500, res, message);
  }
}

module.exports = ApiResponse;
