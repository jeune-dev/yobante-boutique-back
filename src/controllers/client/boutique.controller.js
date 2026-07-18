const BoutiqueClientService = require('../../services/client/boutique.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');

exports.liste = asyncHandler(async (req, res) => {
  const result = await BoutiqueClientService.listeBoutiques();
  return ok(res, { boutiques: result.boutiques }, 'Boutiques');
});
