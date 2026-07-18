// ─────────────────────────────────────────────────────────────
// controllers/admin/produit.controller.js
// ─────────────────────────────────────────────────────────────
const GestionProduitService = require('../../services/admin/produit.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');

exports.create = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.createProduit(req.body, req.files);
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { produit: result.produit }, result.message);
});

exports.getAll = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.getAllProduits(req.query);
  return ok(res, { produits: result.produits, pagination: result.pagination }, result.message);
});

exports.getOne = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.getProduitById(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { produit: result.produit }, 'Produit récupéré');
});

exports.update = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.updateProduit(req.params.id, req.body, req.files);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { produit: result.produit }, result.message);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.deleteProduit(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, {}, result.message);
});

exports.updateStock = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.updateStock(req.params.id, req.body.quantite);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { produit: result.produit }, result.message);
});

exports.toggleFeatured = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.toggleFeatured(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { produit: result.produit }, result.message);
});

exports.toggleVisibilite = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.toggleVisibilite(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { produit: result.produit }, result.message);
});

exports.validerStep1 = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.validerProduitStep1(req.params.id);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { produit: result.produit }, result.message);
});

exports.validerStep2 = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.validerProduitStep2(req.params.id);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { produit: result.produit }, result.message);
});

exports.rejeter = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.rejeterProduit(req.params.id, req.body.motif);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { produit: result.produit }, result.message);
});

exports.getAValider = asyncHandler(async (req, res) => {
  const result = await GestionProduitService.getProduitsAValider();
  return ok(
    res,
    { produits: result.produits, total: result.total },
    'Produits en attente de validation'
  );
});
