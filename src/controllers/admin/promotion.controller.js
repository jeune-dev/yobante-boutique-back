const PromotionService = require('../../services/admin/promotion.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAll = async (req, res) => {
  try {
    const result = await PromotionService.getAll(req.query);
    return ApiResponse.success(200, res, 'Liste des promotions', result);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await PromotionService.getById(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Promotion', { promotion: result.promotion });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const result = await PromotionService.create(req.body);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(201, res, result.message, { promotion: result.promotion });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const result = await PromotionService.update(req.params.id, req.body);
    if (!result.success) {
      return result.message === 'Promotion introuvable'
        ? ApiResponse.notFound(res, result.message)
        : ApiResponse.badRequest(res, result.message);
    }
    return ApiResponse.success(200, res, result.message, { promotion: result.promotion });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await PromotionService.remove(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const result = await PromotionService.toggleActive(req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Statut mis à jour', { promotion: result.promotion });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getParSection = async (req, res) => {
  try {
    const result = await PromotionService.getParSection();
    return ApiResponse.success(200, res, 'Promotions par section', { sections: result.sections });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
