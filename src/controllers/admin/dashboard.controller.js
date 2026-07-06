// ─────────────────────────────────────────────────────────────
// controllers/admin/dashboard.controller.js
// ─────────────────────────────────────────────────────────────
const DashboardService = require('../../services/admin/dashboard.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

exports.getStats = async (req, res) => {
  try {
    const result = await DashboardService.getStatsGlobales();
    return ApiResponse.success(200, res, 'Statistiques récupérées', {
      totalClients: result.totalClients,
      totalProduits: result.totalProduits,
      totalCommandes: result.totalCommandes,
      chiffreAffaires: result.chiffreAffaires,
    });
  } catch (err) {
    logger.error('Erreur getStats dashboard :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la récupération des statistiques');
  }
};

exports.getCommandesParStatut = async (req, res) => {
  try {
    const result = await DashboardService.getCommandesParStatut();
    return ApiResponse.success(200, res, 'Répartition des commandes récupérée', { stats: result.stats });
  } catch (err) {
    logger.error('Erreur getCommandesParStatut :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.getRevenus = async (req, res) => {
  try {
    const annee = req.query.annee ? Number(req.query.annee) : undefined;
    const result = await DashboardService.getRevenusParMois(annee);
    return ApiResponse.success(200, res, 'Revenus récupérés', { revenus: result.revenus });
  } catch (err) {
    logger.error('Erreur getRevenus :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.getProduitsPlusVendus = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await DashboardService.getProduitsPlusVendus(limit);
    return ApiResponse.success(200, res, 'Produits les plus vendus récupérés', { produits: result.produits });
  } catch (err) {
    logger.error('Erreur getProduitsPlusVendus :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.getClientsActifs = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await DashboardService.getClientsActifs(limit);
    return ApiResponse.success(200, res, 'Clients les plus actifs récupérés', { clients: result.clients });
  } catch (err) {
    logger.error('Erreur getClientsActifs :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.getCommandesRecentes = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await DashboardService.getCommandesRecentes(limit);
    return ApiResponse.success(200, res, 'Commandes récentes récupérées', { commandes: result.commandes });
  } catch (err) {
    logger.error('Erreur getCommandesRecentes :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.getStockAlertes = async (req, res) => {
  try {
    const seuil = req.query.seuil ? Number(req.query.seuil) : 5;
    const result = await DashboardService.getStockAlertes(seuil);
    return ApiResponse.success(200, res, 'Alertes stock récupérées', { produits: result.produits });
  } catch (err) {
    logger.error('Erreur getStockAlertes :', err);
    return ApiResponse.internalServerError(res);
  }
};
