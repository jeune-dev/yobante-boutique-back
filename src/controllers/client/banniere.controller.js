const BanniereClientService = require('../../services/client/banniere.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.getActives = async (req, res) => {
  try {
    const result = await BanniereClientService.getActives();
    return ApiResponse.success(200, res, 'Bannières', { bannieres: result.bannieres });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
