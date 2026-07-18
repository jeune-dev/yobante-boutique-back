/**
 * Profil Controller (Client)
 * Gère le profil utilisateur, l'avatar et les adresses
 */
const ProfilService = require('../../services/client/profil.service');
const formatUser = require('../../utils/formatUser');
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const { BadRequestError, NotFoundError, ConflictError } = require('../../errors/AppError');

/**
 * GET /api/profile (protégé)
 * Récupérer mon profil utilisateur
 */
exports.get = asyncHandler(async (req, res) => {
  const result = await ProfilService.getProfil(req.user.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { user: formatUser(result.user) }, 'Profil récupéré');
});

/**
 * PUT /api/profile (protégé)
 * Mettre à jour mon profil (nom, prénom, téléphone, etc)
 */
exports.update = asyncHandler(async (req, res) => {
  const result = await ProfilService.updateProfil(req.user.id, req.body);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { user: formatUser(result.user) }, result.message);
});

/**
 * PATCH /api/profile/avatar (protégé)
 * Mettre à jour mon avatar (upload sur Cloudinary)
 */
exports.updateAvatar = asyncHandler(async (req, res) => {
  const result = await ProfilService.updateAvatar(req.user.id, req.file);
  if (!result.success) throw new BadRequestError(result.message);
  return ok(res, { avatar: result.avatar }, result.message);
});

/**
 * GET /api/profile/adresses (protégé)
 * Récupérer mes adresses de livraison
 */
exports.getAdresses = asyncHandler(async (req, res) => {
  const result = await ProfilService.getAdresses(req.user.id);
  return ok(res, { adresses: result.adresses }, 'Adresses récupérées');
});

/**
 * POST /api/profile/adresses (protégé)
 * Ajouter une nouvelle adresse (max 5)
 */
exports.ajouterAdresse = asyncHandler(async (req, res) => {
  const result = await ProfilService.ajouterAdresse(req.user.id, req.body);
  if (!result.success) throw new BadRequestError(result.message);
  return created(res, { adresse: result.adresse }, result.message);
});

/**
 * PUT /api/profile/adresses/:id (protégé)
 * Mettre à jour une adresse
 */
exports.updateAdresse = asyncHandler(async (req, res) => {
  const result = await ProfilService.updateAdresse(req.user.id, req.params.id, req.body);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { adresse: result.adresse }, result.message);
});

/**
 * DELETE /api/profile/adresses/:id (protégé)
 * Supprimer une adresse
 */
exports.supprimerAdresse = asyncHandler(async (req, res) => {
  const result = await ProfilService.supprimerAdresse(req.user.id, req.params.id);
  if (!result.success) {
    if (result.status === 409) throw new ConflictError(result.message);
    throw new NotFoundError(result.message);
  }
  return ok(res, {}, result.message);
});

/**
 * PATCH /api/profile/adresses/:id/default (protégé)
 * Définir une adresse comme adresse par défaut
 */
exports.setDefault = asyncHandler(async (req, res) => {
  const result = await ProfilService.setAdresseDefault(req.user.id, req.params.id);
  if (!result.success) throw new NotFoundError(result.message);
  return ok(res, { adresse: result.adresse }, result.message);
});
