const { Panier, Produit } = require('../../models');

const DELIVERY_FEE = 500;
const FREE_DELIVERY_THRESHOLD = 10000;

function computeTotals(items) {
  const sousTotal = items.reduce((total, item) => total + item.sousTotal, 0);
  const fraisLivraison = sousTotal >= FREE_DELIVERY_THRESHOLD ? 0 : items.length > 0 ? DELIVERY_FEE : 0;
  const total = sousTotal + fraisLivraison;
  return { sousTotal, fraisLivraison, total };
}

function formatPanierItems(panierRows) {
  return panierRows.map((item) => {
    const produit = item.Produit;
    const prixUnitaire = produit.prixPromo ? Number(produit.prixPromo) : Number(produit.prix);
    const sousTotal = prixUnitaire * item.quantite;

    return {
      id: item.id,
      produit: {
        id: produit.id,
        nom: produit.nom,
        slug: produit.slug,
        images: produit.images,
        prix: Number(produit.prix),
        prixPromo: produit.prixPromo ? Number(produit.prixPromo) : null,
        stock: produit.stock,
        isActive: produit.isActive,
      },
      quantite: item.quantite,
      prixUnitaire,
      sousTotal,
    };
  });
}

async function getPanier(userId) {
  const panierRows = await Panier.findAll({
    where: { userId },
    include: [{ model: Produit }],
  });

  const items = formatPanierItems(panierRows);
  const totals = computeTotals(items);
  return { items, ...totals };
}

async function ajouterAuPanier(userId, produitId, quantite) {
  const produit = await Produit.findOne({ where: { id: produitId, isActive: true } });
  if (!produit) {
    const error = new Error('Produit introuvable ou non disponible');
    error.status = 404;
    throw error;
  }

  const existing = await Panier.findOne({ where: { userId, produitId } });
  const nouvelleQuantite = existing ? existing.quantite + quantite : quantite;

  if (nouvelleQuantite > produit.stock) {
    const error = new Error('Quantité demandée supérieure au stock disponible');
    error.status = 400;
    throw error;
  }

  if (existing) {
    existing.quantite = nouvelleQuantite;
    await existing.save();
  } else {
    await Panier.create({ userId, produitId, quantite });
  }

  return getPanier(userId);
}

async function modifierQuantite(userId, produitId, quantite) {
  const ligne = await Panier.findOne({ where: { userId, produitId }, include: [{ model: Produit }] });
  if (!ligne) {
    const error = new Error('Article du panier introuvable');
    error.status = 404;
    throw error;
  }

  if (quantite === 0) {
    await ligne.destroy();
    return getPanier(userId);
  }

  if (quantite > ligne.Produit.stock) {
    const error = new Error('Quantité demandée supérieure au stock disponible');
    error.status = 400;
    throw error;
  }

  ligne.quantite = quantite;
  await ligne.save();
  return getPanier(userId);
}

async function retirerDuPanier(userId, produitId) {
  const ligne = await Panier.findOne({ where: { userId, produitId } });
  if (!ligne) {
    const error = new Error('Article du panier introuvable');
    error.status = 404;
    throw error;
  }

  await ligne.destroy();
  return { message: 'Article retiré du panier' };
}

async function viderPanier(userId) {
  await Panier.destroy({ where: { userId } });
  return { message: 'Panier vidé' };
}

async function calculerTotal(userId) {
  return getPanier(userId);
}

module.exports = {
  getPanier,
  ajouterAuPanier,
  modifierQuantite,
  retirerDuPanier,
  viderPanier,
  calculerTotal,
};
