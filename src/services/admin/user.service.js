const { Op } = require('sequelize');
const { User, Commande } = require('../../models');
const { paginateResult } = require('../../utils/paginate');

async function getAllUsers(filters = {}, pagination) {
  const where = {};
  if (filters.email) where.email = { [Op.iLike]: `%${filters.email}%` };
  if (filters.nom) where.nom = { [Op.iLike]: `%${filters.nom}%` };
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true' || filters.isActive === true;

  const { page, limit, offset } = pagination;
  const { rows, count } = await User.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit, offset, attributes: { exclude: ['password'] } });
  return { rows, count, totalPages: paginateResult(count, page, limit).totalPages };
}

async function getUserById(id) {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] }, include: [{ model: Commande }] });
  if (!user) throw Object.assign(new Error('Utilisateur introuvable'), { status: 404 });
  return user;
}

async function toggleActive(id) {
  const user = await User.findByPk(id);
  if (!user) throw Object.assign(new Error('Utilisateur introuvable'), { status: 404 });
  user.isActive = !user.isActive;
  await user.save();
  return user;
}

async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) throw Object.assign(new Error('Utilisateur introuvable'), { status: 404 });
  await user.destroy();
  return { message: 'Utilisateur supprimé' };
}

module.exports = { getAllUsers, getUserById, toggleActive, deleteUser };
