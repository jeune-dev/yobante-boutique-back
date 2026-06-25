const paiementService = require('../../services/admin/paiement.service');
const { paginate } = require('../../utils/paginate');
const { success } = require('../../utils/formatResponse');

async function getAll(req, res, next) {
  try {
    const pagination = paginate(req.query);
    const result = await paiementService.getAllPaiements(req.query, pagination);
    return success(res, result, 'Paiements récupérés');
  } catch (err) {
    next(err);
  }
}

async function updateStatut(req, res, next) {
  try {
    const paiement = await paiementService.updateStatut(req.params.id, req.body.statut);
    return success(res, paiement, 'Statut du paiement mis à jour');
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const paiement = await paiementService.getPaiementById(req.params.id);
    return success(res, paiement, 'Paiement récupéré');
  } catch (err) {
    next(err);
  }
}

async function rembourser(req, res, next) {
  try {
    const paiement = await paiementService.updateStatut(req.params.id, 'rembourse');
    return success(res, paiement, 'Paiement remboursé');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, updateStatut, rembourser };
