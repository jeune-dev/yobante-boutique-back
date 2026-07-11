const PromotionClientService = require('../../services/client/promotion.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.getSections = async (req, res) => {
  try {
    const result = await PromotionClientService.getSections();
    return ApiResponse.success(200, res, 'Sections promotionnelles', { sections: result.sections });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getActives = async (req, res) => {
  try {
    const result = await PromotionClientService.getActives();
    // Tableau renvoyé directement dans `data` (format attendu par l'app mobile).
    return ApiResponse.success(200, res, 'Promotions actives', result.promotions);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getSection = async (req, res) => {
  const sections = ['nos_promos_du_moment', 'a_ne_pas_rater', 'nos_promos_a_venir'];
  if (!sections.includes(req.params.section)) {
    return ApiResponse.badRequest(
      res,
      `Section invalide. Valeurs acceptées : ${sections.join(', ')}`
    );
  }
  try {
    const result = await PromotionClientService.getSection(req.params.section);
    return ApiResponse.success(200, res, `Promotions : ${req.params.section}`, {
      promotions: result.promotions,
    });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
