/**
 * Panier Controller (Client)
 * Gère le shopping cart utilisateur
 */
const PanierService = require('../../services/client/panier.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

/**
 * GET /api/panier (protégé)
 * Récupérer le panier de l'utilisateur avec calculs
 */
exports.getPanier = async (req, res) => {
  try {
    const result = await PanierService.getPanier(req.user.id);
    return ApiResponse.success(200, res, 'Panier récupéré', {
      items: result.items,
      sousTotal: result.sousTotal,
      fraisLivraison: result.fraisLivraison,
      total: result.total,
    });
  } catch (err) {
    logger.error('Erreur getPanier', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * POST /api/panier (protégé)
 * Ajouter un produit au panier
 */
exports.ajouter = async (req, res) => {
  const { produitId, quantite } = req.body;

  try {
    const result = await PanierService.ajouterAuPanier(req.user.id, produitId, quantite);
    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, {
      items: result.items,
      sousTotal: result.sousTotal,
      fraisLivraison: result.fraisLivraison,
      total: result.total,
    });
  } catch (err) {
    logger.error('Erreur ajouter panier', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * PATCH /api/panier/:produitId (protégé)
 * Modifier la quantité d'un produit
 */
exports.modifier = async (req, res) => {
  try {
    const result = await PanierService.modifierQuantite(
      req.user.id,
      req.params.produitId,
      req.body.quantite
    );
    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, {
      items: result.items,
      sousTotal: result.sousTotal,
      fraisLivraison: result.fraisLivraison,
      total: result.total,
    });
  } catch (err) {
    logger.error('Erreur modifier panier', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * DELETE /api/panier/:produitId (protégé)
 * Retirer un produit du panier
 */
exports.retirer = async (req, res) => {
  try {
    const result = await PanierService.retirerDuPanier(req.user.id, req.params.produitId);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur retirer panier', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * DELETE /api/panier (protégé)
 * Vider complètement le panier
 */
exports.vider = async (req, res) => {
  try {
    const result = await PanierService.viderPanier(req.user.id);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur vider panier', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};
