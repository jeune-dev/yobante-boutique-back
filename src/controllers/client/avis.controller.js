const avisService = require('../../services/client/avis.service');
const { success } = require('../../utils/formatResponse');

async function poster(req, res, next) {
  try {
    const avis = await avisService.posterAvis(req.user.id, req.body);
    return success(res, avis, 'Avis soumis, en attente de modération', 201);
  } catch (err) {
    next(err);
  }
}

async function getMes(req, res, next) {
  try {
    const avis = await avisService.getMesAvis(req.user.id);
    return success(res, avis, 'Mes avis récupérés');
  } catch (err) {
    next(err);
  }
}

async function supprimer(req, res, next) {
  try {
    const result = await avisService.supprimerAvis(req.user.id, req.params.id);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

module.exports = { poster, getMes, supprimer };
