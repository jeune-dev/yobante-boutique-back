const sequelize = require('../../config/db');
const { Order, OrderItem, Product, ProductImage } = require('../../models');
const { getPagination, paginateResult } = require('../../utils/pagination');

const INCLUDE = [{
  model: OrderItem, as: 'articles',
  include: [{ model: Product, as: 'produit', include: [{ model: ProductImage, as: 'images', limit: 1 }] }],
}];

const createOrder = async (clientId, { items, adresseLivraison, notes }) => {
  const t = await sequelize.transaction();
  try {
    let total = 0;
    const resolved = [];

    for (const item of items) {
      const product = await Product.findOne({ where: { id: item.productId, estActif: true }, transaction: t });
      if (!product)                    throw { status: 404, message: `Produit ${item.productId} introuvable` };
      if (product.stock < item.quantite) throw { status: 400, message: `Stock insuffisant pour "${product.nom}"` };

      total += parseFloat(product.prix) * item.quantite;
      resolved.push({ product, quantite: item.quantite });
    }

    const order = await Order.create({ clientId, total, adresseLivraison, notes }, { transaction: t });

    await OrderItem.bulkCreate(
      resolved.map(({ product, quantite }) => ({
        commandeId: order.id, produitId: product.id, quantite, prixUnitaire: product.prix,
      })),
      { transaction: t }
    );

    await Promise.all(
      resolved.map(({ product, quantite }) =>
        product.update({ stock: product.stock - quantite }, { transaction: t })
      )
    );

    await t.commit();
    return order.reload({ include: INCLUDE });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const getMyOrders = async (clientId, { page, limit } = {}) => {
  const { limit: l, offset, page: p } = getPagination(page, limit);
  const { count, rows } = await Order.findAndCountAll({
    where: { clientId }, include: INCLUDE,
    limit: l, offset, order: [['creeLe', 'DESC']], distinct: true,
  });
  return paginateResult(count, rows, p, l);
};

const getMyOrderById = async (clientId, orderId) => {
  const order = await Order.findOne({ where: { id: orderId, clientId }, include: INCLUDE });
  if (!order) throw { status: 404, message: 'Commande introuvable' };
  return order;
};

const cancelOrder = async (clientId, orderId) => {
  const order = await Order.findOne({
    where: { id: orderId, clientId },
    include: [{ model: OrderItem, as: 'articles' }],
  });
  if (!order) throw { status: 404, message: 'Commande introuvable' };
  if (order.statut !== 'en_attente') throw { status: 400, message: 'Seules les commandes en attente peuvent être annulées' };

  const t = await sequelize.transaction();
  try {
    await order.update({ statut: 'annulee' }, { transaction: t });
    await Promise.all(
      order.articles.map(item =>
        Product.increment({ stock: item.quantite }, { where: { id: item.produitId }, transaction: t })
      )
    );
    await t.commit();
    return order;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { createOrder, getMyOrders, getMyOrderById, cancelOrder };
