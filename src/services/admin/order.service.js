const { Order, OrderItem, User, Product, ProductImage } = require('../../models');
const { getPagination, paginateResult } = require('../../utils/pagination');

const INCLUDE = [
  { model: User, as: 'client', attributes: ['id', 'nom', 'prenom', 'email'] },
  {
    model: OrderItem, as: 'articles',
    include: [{ model: Product, as: 'produit', include: [{ model: ProductImage, as: 'images', limit: 1 }] }],
  },
];

const getAllOrders = async ({ page, limit, statut } = {}) => {
  const { limit: l, offset, page: p } = getPagination(page, limit);
  const where = statut ? { statut } : {};

  const { count, rows } = await Order.findAndCountAll({
    where, include: INCLUDE, limit: l, offset,
    order: [['creeLe', 'DESC']], distinct: true,
  });
  return paginateResult(count, rows, p, l);
};

const getOrderById = async (id) => {
  const order = await Order.findByPk(id, { include: INCLUDE });
  if (!order) throw { status: 404, message: 'Commande introuvable' };
  return order;
};

const updateOrderStatus = async (id, statut) => {
  const order = await Order.findByPk(id);
  if (!order) throw { status: 404, message: 'Commande introuvable' };
  await order.update({ statut });
  return order;
};

module.exports = { getAllOrders, getOrderById, updateOrderStatus };
