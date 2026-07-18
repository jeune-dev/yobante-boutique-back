const FraisLivraisonService = require('../../services/admin/frais-livraison.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { NotFoundError } = require('../../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await FraisLivraisonService.getAll();
  return ok(res, { frais: result.frais }, 'Tarifs de livraison');
});

exports.getById = asyncHandler(async (req, res) => {
  const result = await FraisLivraisonService.getById(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { frais: result.frais }, 'Tarif');
});

exports.create = asyncHandler(async (req, res) => {
  const result = await FraisLivraisonService.create(req.body);
  return created(res, { frais: result.frais }, result.message);
});

exports.update = asyncHandler(async (req, res) => {
  const result = await FraisLivraisonService.update(req.params.id, req.body);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { frais: result.frais }, result.message);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await FraisLivraisonService.remove(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, {}, result.message);
});

exports.toggleActive = asyncHandler(async (req, res) => {
  const result = await FraisLivraisonService.toggleActive(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { frais: result.frais }, 'Statut mis à jour');
});
