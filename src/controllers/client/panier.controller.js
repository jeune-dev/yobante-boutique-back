const panierService = require('../../services/client/panier.service');
const { success } = require('../../utils/formatResponse');

async function getPanier(req, res, next) {
  try {
    const panier = await panierService.getPanier(req.user.id);
    return success(res, panier, 'Panier récupéré');
  } catch (err) {
    next(err);
  }
}

async function ajouter(req, res, next) {
  try {
    const { produitId, quantite } = req.body;
    const panier = await panierService.ajouterAuPanier(req.user.id, produitId, quantite);
    return success(res, panier, 'Produit ajouté au panier');
  } catch (err) {
    next(err);
  }
}

async function modifier(req, res, next) {
  try {
    const produitId = Number(req.params.produitId);
    const { quantite } = req.body;
    const panier = await panierService.modifierQuantite(req.user.id, produitId, quantite);
    return success(res, panier, 'Quantité du panier mise à jour');
  } catch (err) {
    next(err);
  }
}

async function retirer(req, res, next) {
  try {
    const produitId = Number(req.params.produitId);
    const result = await panierService.retirerDuPanier(req.user.id, produitId);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

async function vider(req, res, next) {
  try {
    const result = await panierService.viderPanier(req.user.id);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPanier,
  ajouter,
  modifier,
  retirer,
  vider,
};
