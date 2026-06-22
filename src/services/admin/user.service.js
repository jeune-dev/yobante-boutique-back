const { Op } = require('sequelize');
const { User } = require('../../models');
const { getPagination, paginateResult } = require('../../utils/pagination');

const SAFE_ATTRS = { exclude: ['motDePasse', 'tokenRafraichissement', 'tokenReinitialisation', 'expirationReinitialisation'] };

const getAllUsers = async ({ page, limit, search, role } = {}) => {
  const { limit: l, offset, page: p } = getPagination(page, limit);
  const where = {};
  if (search) where[Op.or] = [
    { nom:    { [Op.iLike]: `%${search}%` } },
    { prenom: { [Op.iLike]: `%${search}%` } },
    { email:  { [Op.iLike]: `%${search}%` } },
  ];
  if (role) where.role = role;

  const { count, rows } = await User.findAndCountAll({
    where, attributes: SAFE_ATTRS,
    limit: l, offset,
    order: [['creeLe', 'DESC']],
  });
  return paginateResult(count, rows, p, l);
};

const getUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: SAFE_ATTRS });
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };
  return user;
};

const updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };
  const allowed = ['nom', 'prenom', 'role', 'estActif'];
  const updates = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
  await user.update(updates);
  const { motDePasse, tokenRafraichissement, tokenReinitialisation, expirationReinitialisation, ...safe } = user.toJSON();
  return safe;
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };
  await user.destroy();
};

const toggleStatus = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };
  await user.update({ estActif: !user.estActif });
  return { estActif: user.estActif };
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, toggleStatus };
