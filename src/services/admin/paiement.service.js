const { Op } = require('sequelize');
const { Paiement, Commande, User } = require('../../models');
const { paginateResult } = require('../../utils/paginate');

async function getAllPaiements(filters = {}, pagination) {
  const where = {};
  if (filters.statut) where.statut = filters.statut;
  if (filters.methode) where.methode = filters.methode;

  const { page, limit, offset } = pagination;
  const { rows, count } = await Paiement.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    include: [{ model: Commande, include: [{ model: User, attributes: ['nom', 'prenom', 'email'] }] }],
  });
  return { rows, count, totalPages: paginateResult(count, page, limit).totalPages };
}

async function updateStatut(id, statut) {
  const paiement = await Paiement.findByPk(id);
  if (!paiement) throw Object.assign(new Error('Paiement introuvable'), { status: 404 });
  paiement.statut = statut;
  if (statut === 'succes') paiement.payeAt = new Date();
  await paiement.save();
  return paiement;
}

async function getPaiementById(id) {
  const paiement = await Paiement.findByPk(id);
  if (!paiement) throw Object.assign(new Error('Paiement introuvable'), { status: 404 });
  return paiement;
}

module.exports = { getAllPaiements, updateStatut, getPaiementById };
