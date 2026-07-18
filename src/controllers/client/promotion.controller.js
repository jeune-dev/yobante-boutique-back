const PromotionClientService = require('../../services/client/promotion.service');
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { BadRequestError } = require('../../errors/AppError');

exports.getSections = asyncHandler(async (req, res) => {
  const result = await PromotionClientService.getSections();
  return ok(res, { sections: result.sections }, 'Sections promotionnelles');
});

exports.getActives = asyncHandler(async (req, res) => {
  const result = await PromotionClientService.getActives();
  // Tableau renvoyé directement dans `data` (format attendu par l'app mobile).
  return ok(res, result.promotions, 'Promotions actives');
});

exports.getSection = asyncHandler(async (req, res) => {
  const sections = ['nos_promos_du_moment', 'a_ne_pas_rater', 'nos_promos_a_venir'];
  if (!sections.includes(req.params.section)) {
    throw new BadRequestError(`Section invalide. Valeurs acceptées : ${sections.join(', ')}`);
  }
  const result = await PromotionClientService.getSection(req.params.section);
  return ok(res, { promotions: result.promotions }, `Promotions : ${req.params.section}`);
});
