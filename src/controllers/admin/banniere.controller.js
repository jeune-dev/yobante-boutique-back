const BanniereService = require('../../services/admin/banniere.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAll = async (req, res) => {
  try {
    const result = await BanniereService.getAll();
    return ApiResponse.success(200, res, 'Liste des bannières', { bannieres: result.bannieres });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const result = await BanniereService.create(req.body, req.file);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(201, res, result.message, { banniere: result.banniere });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const result = await BanniereService.update(req.params.id, req.body, req.file);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message, { banniere: result.banniere });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await BanniereService.remove(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const result = await BanniereService.toggleActive(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Statut mis à jour', { banniere: result.banniere });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.reordonner = async (req, res) => {
  try {
    const result = await BanniereService.reordonner(req.body.ordres);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
