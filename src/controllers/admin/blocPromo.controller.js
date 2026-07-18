const BlocPromoService = require('../../services/admin/blocPromo.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAll = async (req, res) => {
  try {
    const result = await BlocPromoService.getAll();
    return ApiResponse.success(200, res, 'Liste des blocs promo', { blocs: result.blocs });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.updateBySection = async (req, res) => {
  try {
    const result = await BlocPromoService.updateBySection(req.params.section, req.body, req.file);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { bloc: result.bloc });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
