const FavoriClientService = require('../../services/client/favori.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.mesFavoris = async (req, res) => {
  try {
    const result = await FavoriClientService.mesFavoris(req.user.id);
    // Tableau renvoyé directement dans `data` (format attendu par l'app mobile).
    return ApiResponse.success(200, res, 'Mes favoris', result.boutiques);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.ajouter = async (req, res) => {
  try {
    const result = await FavoriClientService.ajouter(req.user.id, req.body.boutiqueId);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(201, res, result.message);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.supprimer = async (req, res) => {
  try {
    const result = await FavoriClientService.supprimer(req.user.id, req.params.boutiqueId);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
