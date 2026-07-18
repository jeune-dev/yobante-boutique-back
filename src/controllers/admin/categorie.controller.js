// ─────────────────────────────────────────────────────────────
// controllers/admin/categorie.controller.js
// ─────────────────────────────────────────────────────────────
const GestionCategorieService = require('../../services/admin/categorie.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');

exports.create = asyncHandler(async (req, res) => {
  const result = await GestionCategorieService.createCategorie(req.body, req.file);
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { categorie: result.categorie }, result.message);
});

exports.getAll = asyncHandler(async (req, res) => {
  const result = await GestionCategorieService.getAllCategories();
  return ok(res, { categories: result.categories }, result.message);
});

exports.getOne = asyncHandler(async (req, res) => {
  const result = await GestionCategorieService.getCategorieById(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { categorie: result.categorie }, 'Catégorie récupérée');
});

exports.update = asyncHandler(async (req, res) => {
  const result = await GestionCategorieService.updateCategorie(req.params.id, req.body, req.file);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { categorie: result.categorie }, result.message);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await GestionCategorieService.deleteCategorie(req.params.id);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, {}, result.message);
});
