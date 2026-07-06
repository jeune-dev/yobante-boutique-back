// ─────────────────────────────────────────────────────────────
// controllers/admin/avis.controller.js
// ─────────────────────────────────────────────────────────────
const GestionAvisService = require('../../services/admin/avis.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

exports.getAll = async (req, res) => {
  try {
    const result = await GestionAvisService.getAllAvis(req.query);
    return ApiResponse.success(200, res, 'Avis récupérés', { avis: result.avis });
  } catch (err) {
    logger.error('Erreur getAll avis :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la récupération des avis');
  }
};

exports.approuver = async (req, res) => {
  try {
    const result = await GestionAvisService.approuverAvis(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { avis: result.avis });
  } catch (err) {
    logger.error('Erreur approuverAvis :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await GestionAvisService.rejeterAvis(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur rejeterAvis :', err);
    return ApiResponse.internalServerError(res);
  }
};
