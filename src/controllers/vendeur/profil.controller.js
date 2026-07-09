const VendeurProfilService = require('../../services/vendeur/profil.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.getProfil = async (req, res) => {
  try {
    const result = await VendeurProfilService.getProfil(req.user.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Profil vendeur', { profil: result.profil });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.updateProfil = async (req, res) => {
  try {
    const result = await VendeurProfilService.updateProfil(req.user.id, req.body);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { profil: result.profil });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.updateLogo = async (req, res) => {
  try {
    if (!req.file) return ApiResponse.badRequest(res, 'Fichier image requis');
    const result = await VendeurProfilService.updateLogo(req.user.id, req.file);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { logo: result.logo });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
