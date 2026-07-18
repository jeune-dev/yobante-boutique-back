// ─────────────────────────────────────────────────────────────
// controllers/admin/avis.controller.js
// ─────────────────────────────────────────────────────────────
const GestionAvisService = require('../../services/admin/avis.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { NotFoundError } = require('../../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await GestionAvisService.getAllAvis(req.query);
  return ok(res, { avis: result.avis, pagination: result.pagination }, 'Avis récupérés');
});

exports.approuver = asyncHandler(async (req, res) => {
  const result = await GestionAvisService.approuverAvis(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { avis: result.avis }, result.message);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await GestionAvisService.rejeterAvis(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, {}, result.message);
});
