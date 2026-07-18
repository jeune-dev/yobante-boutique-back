const PromotionService = require('../../services/admin/promotion.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await PromotionService.getAll(req.query);
  return ok(res, result, 'Liste des promotions');
});

exports.getById = asyncHandler(async (req, res) => {
  const result = await PromotionService.getById(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { promotion: result.promotion }, 'Promotion');
});

exports.create = asyncHandler(async (req, res) => {
  const result = await PromotionService.create(req.body);
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { promotion: result.promotion }, result.message);
});

exports.update = asyncHandler(async (req, res) => {
  const result = await PromotionService.update(req.params.id, req.body);
  if (!result.success) {
    if (result.message === 'Promotion introuvable') throw new NotFoundError(result.message);
    throw new BadRequestError(result.message);
  }
  return ok(res, { promotion: result.promotion }, result.message);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await PromotionService.remove(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, {}, result.message);
});

exports.toggleActive = asyncHandler(async (req, res) => {
  const result = await PromotionService.toggleActive(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { promotion: result.promotion }, 'Statut mis à jour');
});

exports.getParSection = asyncHandler(async (req, res) => {
  const result = await PromotionService.getParSection();
  return ok(res, { sections: result.sections }, 'Promotions par section');
});
