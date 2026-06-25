const { Op } = require('sequelize');
const { Commande, CommandeItem, User, Paiement, Adresse, Produit } = require('../../models');
const { paginateResult } = require('../../utils/paginate');

async function getAllCommandes(filters = {}, pagination) {
  const where = {};
  if (filters.statut) where.statut = filters.statut;
  if (filters.userId) where.userId = filters.userId;
  if (filters.reference) where.reference = { [Op.iLike]: `%${filters.reference}%` };
  if (filters.dateFrom || filters.dateTo) where.createdAt = {};
  if (filters.dateFrom) where.createdAt[Op.gte] = new Date(filters.dateFrom);
  if (filters.dateTo) where.createdAt[Op.lte] = new Date(filters.dateTo);

  const { page, limit, offset } = pagination;
  const { rows, count } = await Commande.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    include: [
      { model: User, attributes: ['id', 'nom', 'prenom', 'email'] },
      { model: CommandeItem, include: [{ model: Produit }] },
      { model: Paiement },
    ],
  });

  return { rows, count, totalPages: paginateResult(count, page, limit).totalPages };
}

async function getCommandeById(id) {
  const commande = await Commande.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'nom', 'prenom', 'email'] },
      { model: CommandeItem, include: [{ model: Produit }] },
      { model: Paiement },
    ],
  });
  if (!commande) {
    const err = new Error('Commande introuvable');
    err.status = 404;
    throw err;
  }
  return commande;
}

async function updateStatut(id, statut, noteAdmin) {
  const commande = await Commande.findByPk(id);
  if (!commande) throw Object.assign(new Error('Commande introuvable'), { status: 404 });
  commande.statut = statut;
  if (noteAdmin !== undefined) commande.noteAdmin = noteAdmin;
  await commande.save();
  return commande;
}

module.exports = { getAllCommandes, getCommandeById, updateStatut };
