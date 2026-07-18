const BanniereClientService = require('../../services/client/banniere.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');

exports.getActives = asyncHandler(async (req, res) => {
  const result = await BanniereClientService.getActives();
  return ok(res, { bannieres: result.bannieres }, 'Bannières');
});
