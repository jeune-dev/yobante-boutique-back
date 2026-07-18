'use strict';
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');
const RayonService = require('../../services/admin/rayon.service');

exports.lister = asyncHandler(async (req, res) => {
  const result = await RayonService.lister(req.query);
  return ok(res, result, 'Rayons récupérés');
});
exports.getById = asyncHandler(async (req, res) => {
  const result = await RayonService.getById(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { rayon: result.rayon }, 'Rayon récupéré');
});
exports.creer = asyncHandler(async (req, res) => {
  const result = await RayonService.creer(req.body);
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { rayon: result.rayon }, result.message);
});
exports.modifier = asyncHandler(async (req, res) => {
  const result = await RayonService.modifier(req.params.id, req.body);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { rayon: result.rayon }, result.message);
});
exports.archiver = asyncHandler(async (req, res) => {
  const result = await RayonService.archiver(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { rayon: result.rayon }, result.message);
});
exports.listerSousRayons = asyncHandler(async (req, res) => {
  const result = await RayonService.listerSousRayons(req.params.rayonId, req.query);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, result, 'Sous-rayons récupérés');
});
exports.creerSousRayon = asyncHandler(async (req, res) => {
  const result = await RayonService.creerSousRayon(req.params.rayonId, req.body);
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { sousRayon: result.sousRayon }, result.message);
});
exports.modifierSousRayon = asyncHandler(async (req, res) => {
  const result = await RayonService.modifierSousRayon(req.params.id, req.body);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { sousRayon: result.sousRayon }, result.message);
});
exports.archiverSousRayon = asyncHandler(async (req, res) => {
  const result = await RayonService.archiverSousRayon(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { sousRayon: result.sousRayon }, result.message);
});
