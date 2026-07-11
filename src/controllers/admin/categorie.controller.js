// ─────────────────────────────────────────────────────────────
// controllers/admin/categorie.controller.js
// ─────────────────────────────────────────────────────────────
const GestionCategorieService = require('../../services/admin/categorie.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

exports.create = async (req, res) => {
  try {
    const result = await GestionCategorieService.createCategorie(req.body, req.file);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(201, res, result.message, { categorie: result.categorie });
  } catch (err) {
    logger.error('Erreur création catégorie :', err);
    return ApiResponse.internalServerError(
      res,
      'Erreur serveur lors de la création de la catégorie'
    );
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await GestionCategorieService.getAllCategories();
    return ApiResponse.success(200, res, result.message, { categories: result.categories });
  } catch (err) {
    logger.error('Erreur récupération catégories :', err);
    return ApiResponse.internalServerError(
      res,
      'Erreur serveur lors de la récupération des catégories'
    );
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await GestionCategorieService.getCategorieById(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Catégorie récupérée', { categorie: result.categorie });
  } catch (err) {
    logger.error('Erreur récupération catégorie :', err);
    return ApiResponse.internalServerError(
      res,
      'Erreur serveur lors de la récupération de la catégorie'
    );
  }
};

exports.update = async (req, res) => {
  try {
    const result = await GestionCategorieService.updateCategorie(req.params.id, req.body, req.file);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { categorie: result.categorie });
  } catch (err) {
    logger.error('Erreur mise à jour catégorie :', err);
    return ApiResponse.internalServerError(
      res,
      'Erreur serveur lors de la mise à jour de la catégorie'
    );
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await GestionCategorieService.deleteCategorie(req.params.id);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    logger.error('Erreur suppression catégorie :', err);
    return ApiResponse.internalServerError(
      res,
      'Erreur serveur lors de la suppression de la catégorie'
    );
  }
};
