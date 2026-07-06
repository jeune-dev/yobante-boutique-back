// ─────────────────────────────────────────────────────────────
// controllers/admin/produit.controller.js
// ─────────────────────────────────────────────────────────────
const GestionProduitService = require('../../services/admin/produit.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

exports.create = async (req, res) => {
  try {
    const result = await GestionProduitService.createProduit(req.body, req.files);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(201, res, result.message, { produit: result.produit });
  } catch (err) {
    logger.error('Erreur création produit :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la création du produit');
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await GestionProduitService.getAllProduits(req.query);
    return ApiResponse.success(200, res, result.message, {
      produits: result.produits,
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error('Erreur récupération produits :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la récupération des produits');
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await GestionProduitService.getProduitById(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Produit récupéré', { produit: result.produit });
  } catch (err) {
    logger.error('Erreur récupération produit :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la récupération du produit');
  }
};

exports.update = async (req, res) => {
  try {
    const result = await GestionProduitService.updateProduit(req.params.id, req.body, req.files);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { produit: result.produit });
  } catch (err) {
    logger.error('Erreur mise à jour produit :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la mise à jour du produit');
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await GestionProduitService.deleteProduit(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur suppression produit :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la suppression du produit');
  }
};

exports.updateStock = async (req, res) => {
  try {
    const result = await GestionProduitService.updateStock(req.params.id, req.body.quantite);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { produit: result.produit });
  } catch (err) {
    logger.error('Erreur mise à jour stock :', err);
    return ApiResponse.internalServerError(res, 'Erreur serveur lors de la mise à jour du stock');
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const result = await GestionProduitService.toggleFeatured(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { produit: result.produit });
  } catch (err) {
    logger.error('Erreur toggle featured :', err);
    return ApiResponse.internalServerError(res);
  }
};

exports.toggleVisibilite = async (req, res) => {
  try {
    const result = await GestionProduitService.toggleVisibilite(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { produit: result.produit });
  } catch (err) {
    logger.error('Erreur toggle visibilité :', err);
    return ApiResponse.internalServerError(res);
  }
};
