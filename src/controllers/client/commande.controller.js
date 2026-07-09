/**
 * Commande Controller (Client)
 * Gère les commandes des clients
 */
const CommandeService = require('../../services/client/commande.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

/**
 * POST /api/commandes (protégé)
 * Créer une nouvelle commande à partir du panier
 */
exports.passer = async (req, res) => {
  try {
    const result = await CommandeService.passerCommande(req.user.id, req.body);
    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(201, res, result.message, {
      commande: result.commande,
    });
  } catch (err) {
    logger.error('Erreur passerCommande', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/commandes (protégé)
 * Récupérer toutes les commandes de l'utilisateur
 */
exports.getMes = async (req, res) => {
  try {
    const result = await CommandeService.getMesCommandes(req.user.id, req.query);
    return ApiResponse.success(200, res, 'Commandes récupérées', {
      commandes: result.commandes,
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error('Erreur getMesCommandes', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/commandes/:id (protégé)
 * Récupérer le détail d'une commande
 */
exports.getOne = async (req, res) => {
  try {
    const result = await CommandeService.getCommandeDetail(req.user.id, req.params.id);
    if (!result.success) {
      const statusCode = result.status || 404;
      if (statusCode === 404) return ApiResponse.notFound(res, result.message);
      if (statusCode === 403) return ApiResponse.forbidden(res, result.message);
      return ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(200, res, 'Commande récupérée', {
      commande: result.commande,
    });
  } catch (err) {
    logger.error('Erreur getCommandeDetail', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * DELETE /api/commandes/:id (protégé)
 * Annuler une commande (si en attente)
 */
exports.annuler = async (req, res) => {
  try {
    const result = await CommandeService.annulerCommande(req.user.id, req.params.id);
    if (!result.success) {
      const statusCode = result.status || 400;
      if (statusCode === 404) return ApiResponse.notFound(res, result.message);
      if (statusCode === 403) return ApiResponse.forbidden(res, result.message);
      return ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, {
      commande: result.commande,
    });
  } catch (err) {
    logger.error('Erreur annulerCommande', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};
