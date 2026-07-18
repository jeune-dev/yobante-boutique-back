const CategorieService = require('../../services/admin/categorie.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { NotFoundError } = require('../../errors/AppError');

// Lecture seule des catégories, ouverte au catalogue client et au formulaire de
// soumission produit du vendeur. L'écriture reste réservée à /admin/categories.
exports.getAll = asyncHandler(async (req, res) => {
  const result = await CategorieService.getAllCategories();
  return ok(res, { categories: result.categories }, 'Catégories');
});

exports.getOne = asyncHandler(async (req, res) => {
  const result = await CategorieService.getCategorieById(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { categorie: result.categorie }, 'Catégorie');
});
