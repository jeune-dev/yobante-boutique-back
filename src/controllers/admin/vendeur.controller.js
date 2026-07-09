const GestionVendeurService = require('../../services/admin/vendeur.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.creerVendeur = async (req, res) => {
  try {
    const result = await GestionVendeurService.creerVendeur(req.body, req.user.id);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(201, res, result.message, {
      user: result.user,
      profil: result.profil,
    });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.listerVendeurs = async (req, res) => {
  try {
    const result = await GestionVendeurService.listerVendeurs(req.query);
    return ApiResponse.success(200, res, 'Liste des vendeurs', result);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getVendeur = async (req, res) => {
  try {
    const result = await GestionVendeurService.getVendeur(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Vendeur', { vendeur: result.vendeur });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.validerStep1 = async (req, res) => {
  try {
    const result = await GestionVendeurService.validerStep1(req.params.id, req.user.id);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { profil: result.profil });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.validerStep2 = async (req, res) => {
  try {
    const result = await GestionVendeurService.validerStep2(req.params.id, req.user.id);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { profil: result.profil });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.rejeterVendeur = async (req, res) => {
  try {
    const result = await GestionVendeurService.rejeterVendeur(req.params.id, req.body.motif);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { profil: result.profil });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.toggleActivation = async (req, res) => {
  try {
    const result = await GestionVendeurService.toggleActivation(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { user: result.user });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.updateProfil = async (req, res) => {
  try {
    const result = await GestionVendeurService.updateProfil(req.params.id, req.body);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { profil: result.profil });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
