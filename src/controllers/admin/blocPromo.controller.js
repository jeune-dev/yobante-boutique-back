const BlocPromoService = require('../../services/admin/blocPromo.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');

/** GET /api/v1/admin/blocs-promo */
exports.getAll = asyncHandler(async (req, res) => {
  const result = await BlocPromoService.getAll();
  return ok(res, { blocs: result.blocs, parSection: result.parSection }, 'Blocs promo');
});

/** GET /api/v1/admin/blocs-promo/:id */
exports.getById = asyncHandler(async (req, res) => {
  const result = await BlocPromoService.getById(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { bloc: result.bloc }, 'Bloc promo');
});

/** POST /api/v1/admin/blocs-promo — crée une sous-section */
exports.creer = asyncHandler(async (req, res) => {
  const result = await BlocPromoService.creer(req.body, req.file);
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { bloc: result.bloc }, result.message);
});

/** PUT /api/v1/admin/blocs-promo/:id */
exports.modifier = asyncHandler(async (req, res) => {
  const result = await BlocPromoService.modifier(req.params.id, req.body, req.file);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { bloc: result.bloc }, result.message);
});

/** DELETE /api/v1/admin/blocs-promo/:id */
exports.supprimer = asyncHandler(async (req, res) => {
  const result = await BlocPromoService.supprimer(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, {}, result.message);
});

/** PATCH /api/v1/admin/blocs-promo/:id/toggle */
exports.toggleActive = asyncHandler(async (req, res) => {
  const result = await BlocPromoService.toggleActive(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { bloc: result.bloc }, result.message);
});

/** POST /api/v1/admin/blocs-promo/reordonner */
exports.reordonner = asyncHandler(async (req, res) => {
  const result = await BlocPromoService.reordonner(req.body.elements);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, {}, result.message);
});

/** PUT /api/v1/admin/blocs-promo/section/:section — compatibilité ascendante */
exports.updateBySection = asyncHandler(async (req, res) => {
  const result = await BlocPromoService.updateBySection(req.params.section, req.body, req.file);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { bloc: result.bloc }, result.message);
});
