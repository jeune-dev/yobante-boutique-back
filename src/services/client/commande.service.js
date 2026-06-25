const { Op } = require('sequelize');
const { Commande, CommandeItem, Panier, Produit, Adresse, Paiement, User } = require('../../models');
const { passerCommandeSchema } = require('../../validations/commande.validation');
const { paginateResult } = require('../../utils/paginate');
const mailer = require('../../utils/mailer');

function buildReference() {
  return `YB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function calculerTotaux(items) {
  const sousTotal = items.reduce((sum, item) => sum + Number(item.sousTotal), 0);
  const fraisLivraison = sousTotal >= 10000 ? 0 : 500;
  return { sousTotal, fraisLivraison, montantTotal: sousTotal + fraisLivraison };
}

async function passerCommande(userId, data) {
  if (!data.methodePaiement) {
    const error = new Error('Méthode de paiement requise');
    error.status = 400;
    throw error;
  }
  const panierItems = await Panier.findAll({
    where: { userId },
    include: [{ model: Produit }],
  });

  if (!panierItems.length) {
    const error = new Error('Panier vide');
    error.status = 400;
    throw error;
  }

  const commandeItems = [];
  for (const item of panierItems) {
    const produit = item.Produit;
    if (!produit || !produit.isActive) {
      const error = new Error(`Produit indisponible: ${item.produitId}`);
      error.status = 400;
      throw error;
    }
    if (item.quantite > produit.stock) {
      const error = new Error(`Stock insuffisant pour ${produit.nom}`);
      error.status = 400;
      throw error;
    }
    const prixUnitaire = produit.prixPromo ? Number(produit.prixPromo) : Number(produit.prix);
    const sousTotal = prixUnitaire * item.quantite;
    commandeItems.push({ produitId: produit.id, quantite: item.quantite, prixUnitaire, sousTotal });
  }

  const totals = await calculerTotaux(commandeItems);
  const commande = await Commande.create({
    reference: buildReference(),
    userId,
    adresseId: data.adresseId,
    note: data.note || null,
    statut: 'en_attente',
    montantTotal: totals.montantTotal,
    fraisLivraison: totals.fraisLivraison,
  });

  for (const item of commandeItems) {
    await CommandeItem.create({
      commandeId: commande.id,
      produitId: item.produitId,
      quantite: item.quantite,
      prixUnitaire: item.prixUnitaire,
      sousTotal: item.sousTotal,
    });
    const produit = await Produit.findByPk(item.produitId);
    produit.stock -= item.quantite;
    await produit.save();
  }

  await Paiement.create({
    commandeId: commande.id,
    userId,
    montant: totals.montantTotal,
    methode: data.methodePaiement,
    statut: data.methodePaiement === 'cash_livraison' ? 'en_attente' : 'en_attente',
  });

  await Panier.destroy({ where: { userId } });
  const user = await User.findByPk(userId);
  await mailer.sendCommandeConfirmation(user.email, commande);

  return await getCommandeDetail(userId, commande.id);
}

async function getMesCommandes(userId, pagination) {
  const { page, limit, offset } = pagination;
  const { rows, count } = await Commande.findAndCountAll({
    where: { userId },
    include: [
      { model: CommandeItem, include: [{ model: Produit }] },
      { model: Adresse },
      { model: Paiement },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return {
    rows,
    count,
    totalPages: paginateResult(count, page, limit).totalPages,
  };
}

async function getCommandeDetail(userId, commandeId) {
  const commande = await Commande.findOne({
    where: { id: commandeId },
    include: [
      { model: CommandeItem, include: [{ model: Produit }] },
      { model: Adresse },
      { model: Paiement },
    ],
  });

  if (!commande) {
    const error = new Error('Commande introuvable');
    error.status = 404;
    throw error;
  }

  if (commande.userId !== userId) {
    const error = new Error('Accès interdit à cette commande');
    error.status = 403;
    throw error;
  }

  return commande;
}

async function annulerCommande(userId, commandeId) {
  const commande = await Commande.findOne({ where: { id: commandeId }, include: [{ model: CommandeItem }] });
  if (!commande) {
    const error = new Error('Commande introuvable');
    error.status = 404;
    throw error;
  }

  if (commande.userId !== userId) {
    const error = new Error('Accès interdit à cette commande');
    error.status = 403;
    throw error;
  }

  if (commande.statut !== 'en_attente') {
    const error = new Error('Seules les commandes en attente peuvent être annulées');
    error.status = 400;
    throw error;
  }

  commande.statut = 'annulee';
  await commande.save();

  for (const item of commande.CommandeItems) {
    const produit = await Produit.findByPk(item.produitId);
    if (produit) {
      produit.stock += item.quantite;
      await produit.save();
    }
  }

  const user = await User.findByPk(userId);
  await mailer.sendCommandeStatut(user.email, commande, 'annulée');

  return commande;
}

module.exports = {
  passerCommande,
  getMesCommandes,
  getCommandeDetail,
  annulerCommande,
};
