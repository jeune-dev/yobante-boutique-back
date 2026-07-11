const BoutiqueClientService = require('../../services/client/boutique.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.liste = async (req, res) => {
  try {
    const result = await BoutiqueClientService.listeBoutiques();
    return ApiResponse.success(200, res, 'Boutiques', { boutiques: result.boutiques });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
