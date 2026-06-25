const avisService = require('../../services/admin/avis.service');
const { paginate } = require('../../utils/paginate');
const { success } = require('../../utils/formatResponse');

async function getAll(req, res, next) {
  try {
    const pagination = paginate(req.query);
    const result = await avisService.getAllAvis(req.query, pagination);
    return success(res, result, 'Avis récupérés');
  } catch (err) {
    next(err);
  }
}

async function toggleApprove(req, res, next) {
  try {
    const avis = await avisService.toggleApprove(req.params.id);
    return success(res, avis, 'Statut d`approbation inversé');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await avisService.deleteAvis(req.params.id);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, toggleApprove, remove };

async function approuver(req, res, next) {
  try {
    const avis = await avisService.toggleApprove(req.params.id);
    return success(res, avis, 'Avis approuvé/désapprouvé');
  } catch (err) {
    next(err);
  }
}

module.exports.approuver = approuver;
