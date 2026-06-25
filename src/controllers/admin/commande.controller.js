const commandeService = require('../../services/admin/commande.service');
const { paginate } = require('../../utils/paginate');
const { success } = require('../../utils/formatResponse');

async function getAll(req, res, next) {
  try {
    const pagination = paginate(req.query);
    const result = await commandeService.getAllCommandes(req.query, pagination);
    return success(res, result, 'Commandes récupérées');
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const commande = await commandeService.getCommandeById(req.params.id);
    return success(res, commande, 'Commande récupérée');
  } catch (err) {
    next(err);
  }
}

async function updateStatut(req, res, next) {
  try {
    const { statut, noteAdmin } = req.body;
    const commande = await commandeService.updateStatut(req.params.id, statut, noteAdmin);
    return success(res, commande, 'Statut mis à jour');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, updateStatut };

async function exportCommandes(req, res, next) {
  try {
    const result = await commandeService.getAllCommandes(req.query, { page: 1, limit: 1000, offset: 0 });
    return success(res, result.rows, 'Export commandes');
  } catch (err) {
    next(err);
  }
}

async function valider(req, res, next) {
  try {
    const commande = await commandeService.updateStatut(req.params.id, 'validee');
    return success(res, commande, 'Commande validée');
  } catch (err) {
    next(err);
  }
}

async function rejeter(req, res, next) {
  try {
    const commande = await commandeService.updateStatut(req.params.id, 'annulee');
    return success(res, commande, 'Commande rejetée');
  } catch (err) {
    next(err);
  }
}

async function mettreEnPreparation(req, res, next) {
  try {
    const commande = await commandeService.updateStatut(req.params.id, 'en_preparation');
    return success(res, commande, 'Commande en préparation');
  } catch (err) {
    next(err);
  }
}

async function marquerExpediee(req, res, next) {
  try {
    const commande = await commandeService.updateStatut(req.params.id, 'expediee');
    return success(res, commande, 'Commande expédiée');
  } catch (err) {
    next(err);
  }
}

async function marquerLivree(req, res, next) {
  try {
    const commande = await commandeService.updateStatut(req.params.id, 'livree');
    return success(res, commande, 'Commande livrée');
  } catch (err) {
    next(err);
  }
}

module.exports.exportCommandes = exportCommandes;
module.exports.valider = valider;
module.exports.rejeter = rejeter;
module.exports.mettreEnPreparation = mettreEnPreparation;
module.exports.marquerExpediee = marquerExpediee;
module.exports.marquerLivree = marquerLivree;
