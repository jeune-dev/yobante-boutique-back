// ─────────────────────────────────────────────────────────────
// controllers/admin/paiement.controller.js
// ─────────────────────────────────────────────────────────────
const GestionPaiementService = require('../../services/admin/paiement.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

exports.getAll = async (req, res) => {
  try {
    const result = await GestionPaiementService.getAllPaiements(req.query);
    return ApiResponse.success(200, res, 'Paiements récupérés', {
      paiements: result.paiements,
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error('Erreur getAll paiements :', err);
    return ApiResponse.internalServerError(
      res,
      'Erreur serveur lors de la récupération des paiements'
    );
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await GestionPaiementService.getPaiementById(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Paiement récupéré', { paiement: result.paiement });
  } catch (err) {
    logger.error('Erreur getOne paiement :', err);
    return ApiResponse.internalServerError(
      res,
      'Erreur serveur lors de la récupération du paiement'
    );
  }
};

exports.confirmer = async (req, res) => {
  try {
    const result = await GestionPaiementService.confirmerPaiement(
      req.params.id,
      req.body.transactionId
    );
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { paiement: result.paiement });
  } catch (err) {
    logger.error('Erreur confirmation paiement :', err);
    return ApiResponse.internalServerError(
      res,
      'Erreur serveur lors de la confirmation du paiement'
    );
  }
};

exports.getRevenusTotal = async (req, res) => {
  try {
    const result = await GestionPaiementService.getRevenusTotal(req.query);
    return ApiResponse.success(200, res, 'Revenus récupérés', {
      total: result.total,
      nbTransactions: result.nbTransactions,
    });
  } catch (err) {
    logger.error('Erreur getRevenusTotal :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors du calcul des revenus');
  }
};

exports.rembourser = async (req, res) => {
  try {
    const result = await GestionPaiementService.rembourserPaiement(req.params.id, req.body.raison);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { paiement: result.paiement });
  } catch (err) {
    logger.error('Erreur remboursement paiement :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors du remboursement');
  }
};
