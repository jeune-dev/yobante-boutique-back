const GestionVendeurService = require('../../services/admin/vendeur.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');

exports.creerVendeur = asyncHandler(async (req, res) => {
  const result = await GestionVendeurService.creerVendeur(req.body, req.user.id);
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { user: result.user, profil: result.profil }, result.message);
});

exports.listerVendeurs = asyncHandler(async (req, res) => {
  const result = await GestionVendeurService.listerVendeurs(req.query);
  return ok(res, result, 'Liste des vendeurs');
});

exports.getVendeur = asyncHandler(async (req, res) => {
  const result = await GestionVendeurService.getVendeur(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { vendeur: result.vendeur }, 'Vendeur');
});

exports.validerStep1 = asyncHandler(async (req, res) => {
  const result = await GestionVendeurService.validerStep1(req.params.id, req.user.id);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { profil: result.profil }, result.message);
});

exports.validerStep2 = asyncHandler(async (req, res) => {
  const result = await GestionVendeurService.validerStep2(req.params.id, req.user.id);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { profil: result.profil }, result.message);
});

exports.rejeterVendeur = asyncHandler(async (req, res) => {
  const result = await GestionVendeurService.rejeterVendeur(req.params.id, req.body.motif);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { profil: result.profil }, result.message);
});

exports.toggleActivation = asyncHandler(async (req, res) => {
  const result = await GestionVendeurService.toggleActivation(req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { user: result.user }, result.message);
});

exports.updateProfil = asyncHandler(async (req, res) => {
  const result = await GestionVendeurService.updateProfil(req.params.id, req.body);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { profil: result.profil }, result.message);
});
