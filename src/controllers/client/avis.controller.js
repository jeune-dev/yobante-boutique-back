/**
 * Avis Controller (Client)
 * Gère les avis et évaluations des produits
 */
const AvisService = require('../../services/client/avis.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

/**
 * POST /api/avis (protégé)
 * Créer un nouvel avis sur un produit
 */
exports.create = async (req, res) => {
  try {
    const result = await AvisService.createAvis(req.user.id, req.body);
    if (!result.success) {
      return ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(201, res, result.message, {
      avis: result.avis,
    });
  } catch (err) {
    logger.error('Erreur création avis', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/avis/me (protégé)
 * Récupérer mes avis
 */
exports.getMes = async (req, res) => {
  try {
    const result = await AvisService.getMesAvis(req.user.id);
    return ApiResponse.success(200, res, 'Avis récupérés', {
      avis: result.avis,
    });
  } catch (err) {
    logger.error('Erreur récupération avis', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * PUT /api/avis/:id (protégé)
 * Mettre à jour un avis
 */
exports.update = async (req, res) => {
  try {
    const result = await AvisService.updateAvis(req.user.id, req.params.id, req.body);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, {
      avis: result.avis,
    });
  } catch (err) {
    logger.error('Erreur mise à jour avis', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * DELETE /api/avis/:id (protégé)
 * Supprimer un avis
 */
exports.remove = async (req, res) => {
  try {
    const result = await AvisService.deleteAvis(req.user.id, req.params.id);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur suppression avis', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};
