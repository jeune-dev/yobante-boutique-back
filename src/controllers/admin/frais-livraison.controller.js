const FraisLivraisonService = require('../../services/admin/frais-livraison.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAll = async (req, res) => {
  try {
    const result = await FraisLivraisonService.getAll();
    return ApiResponse.success(200, res, 'Tarifs de livraison', { frais: result.frais });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await FraisLivraisonService.getById(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Tarif', { frais: result.frais });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const result = await FraisLivraisonService.create(req.body);
    return ApiResponse.success(201, res, result.message, { frais: result.frais });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const result = await FraisLivraisonService.update(req.params.id, req.body);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { frais: result.frais });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await FraisLivraisonService.remove(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const result = await FraisLivraisonService.toggleActive(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Statut mis à jour', { frais: result.frais });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
