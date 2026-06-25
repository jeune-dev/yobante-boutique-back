const commandeService = require('../../services/client/commande.service');
const { success } = require('../../utils/formatResponse');
const { paginate } = require('../../utils/paginate');

async function passer(req, res, next) {
  try {
    const commande = await commandeService.passerCommande(req.user.id, req.body);
    return success(res, commande, 'Commande créée avec succès', 201);
  } catch (err) {
    next(err);
  }
}

async function getMes(req, res, next) {
  try {
    const pagination = paginate(req.query);
    const result = await commandeService.getMesCommandes(req.user.id, pagination);
    return success(res, result, 'Commandes récupérées');
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const commande = await commandeService.getCommandeDetail(req.user.id, req.params.id);
    return success(res, commande, 'Détail de la commande récupéré');
  } catch (err) {
    next(err);
  }
}

async function annuler(req, res, next) {
  try {
    const commande = await commandeService.annulerCommande(req.user.id, req.params.id);
    return success(res, commande, 'Commande annulée');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  passer,
  getMes,
  getOne,
  annuler,
};
