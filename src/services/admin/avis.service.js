const { Op } = require('sequelize');
const { Avis, User, Produit } = require('../../models');
const { paginateResult } = require('../../utils/paginate');

async function getAllAvis(filters = {}, pagination) {
  const where = {};
  if (filters.isApproved !== undefined) where.isApproved = filters.isApproved === 'true' || filters.isApproved === true;
  if (filters.produitId) where.produitId = filters.produitId;
  if (filters.userId) where.userId = filters.userId;

  const { page, limit, offset } = pagination;
  const { rows, count } = await Avis.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit, offset, include: [{ model: User, attributes: ['id', 'nom', 'prenom'] }, { model: Produit }] });
  return { rows, count, totalPages: paginateResult(count, page, limit).totalPages };
}

async function toggleApprove(id) {
  const avis = await Avis.findByPk(id);
  if (!avis) throw Object.assign(new Error('Avis introuvable'), { status: 404 });
  avis.isApproved = !avis.isApproved;
  await avis.save();
  return avis;
}

async function deleteAvis(id) {
  const avis = await Avis.findByPk(id);
  if (!avis) throw Object.assign(new Error('Avis introuvable'), { status: 404 });
  await avis.destroy();
  return { message: 'Avis supprimé' };
}

module.exports = { getAllAvis, toggleApprove, deleteAvis };
