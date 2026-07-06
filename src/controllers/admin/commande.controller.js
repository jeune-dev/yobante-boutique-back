// ─────────────────────────────────────────────────────────────
// controllers/admin/commande.controller.js
// ─────────────────────────────────────────────────────────────
const GestionCommandeService = require('../../services/admin/commande.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

exports.getAll = async (req, res) => {
  try {
    const result = await GestionCommandeService.getAllCommandes(req.query);
    return ApiResponse.success(200, res, 'Commandes récupérées', {
      commandes: result.commandes,
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error('Erreur getAll commandes :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la récupération des commandes');
  }
};

exports.exportCsv = async (req, res) => {
  try {
    const result = await GestionCommandeService.exportCommandes(req.query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="commandes-${Date.now()}.csv"`);
    return res.status(200).send(result.csv);
  } catch (err) {
    logger.error('Erreur export commandes :', err);
    return ApiResponse.internalServerError(res, "Erreur serveur lors de l'export des commandes");
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await GestionCommandeService.getCommandeById(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Commande récupérée', { commande: result.commande });
  } catch (err) {
    logger.error('Erreur getOne commande :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la récupération de la commande');
  }
};

exports.valider = async (req, res) => {
  try {
    const result = await GestionCommandeService.validerCommande(req.params.id, req.body.noteAdmin);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { commande: result.commande });
  } catch (err) {
    logger.error('Erreur validerCommande :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.rejeter = async (req, res) => {
  try {
    const result = await GestionCommandeService.rejeterCommande(req.params.id, req.body.raison);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { commande: result.commande });
  } catch (err) {
    logger.error('Erreur rejeterCommande :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.mettreEnPreparation = async (req, res) => {
  try {
    const result = await GestionCommandeService.mettreEnPreparation(req.params.id);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { commande: result.commande });
  } catch (err) {
    logger.error('Erreur mettreEnPreparation :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.marquerExpediee = async (req, res) => {
  try {
    const result = await GestionCommandeService.marquerExpediee(req.params.id, req.body.trackingInfo);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { commande: result.commande });
  } catch (err) {
    logger.error('Erreur marquerExpediee :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.marquerLivree = async (req, res) => {
  try {
    const result = await GestionCommandeService.marquerLivree(req.params.id);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { commande: result.commande });
  } catch (err) {
    logger.error('Erreur marquerLivree :', err);
    return ApiResponse.internalServerError(res);
  }
};
