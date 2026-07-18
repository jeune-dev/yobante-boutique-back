const VendeurProfilService = require('../../services/vendeur/profil.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../errors/AppError');

exports.getProfil = asyncHandler(async (req, res) => {
  const result = await VendeurProfilService.getProfil(req.user.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { profil: result.profil }, 'Profil vendeur');
});

exports.updateProfil = asyncHandler(async (req, res) => {
  const result = await VendeurProfilService.updateProfil(req.user.id, req.body);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { profil: result.profil }, result.message);
});

exports.updateLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequestError('Fichier image requis');
  const result = await VendeurProfilService.updateLogo(req.user.id, req.file);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { logo: result.logo }, result.message);
});
