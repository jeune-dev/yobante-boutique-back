const { Op } = require('sequelize');
const { Product, ProductImage, Category, User } = require('../../models');
const { getPagination, paginateResult } = require('../../utils/pagination');
const { deleteFromCloudinary } = require('../../middlewares/uploadService');

const INCLUDE = [
  { model: ProductImage, as: 'images' },
  { model: Category,     as: 'categorie', attributes: ['id', 'nom'] },
  { model: User,         as: 'vendeur',   attributes: ['id', 'nom', 'prenom', 'email'] },
];

const getAllProducts = async ({ page, limit, search, vendeurId, estActif } = {}) => {
  const { limit: l, offset, page: p } = getPagination(page, limit);
  const where = {};
  if (search)             where.nom       = { [Op.iLike]: `%${search}%` };
  if (vendeurId)          where.vendeurId = vendeurId;
  if (estActif !== undefined) where.estActif = estActif === 'true' || estActif === true;

  const { count, rows } = await Product.findAndCountAll({
    where, include: INCLUDE, limit: l, offset,
    order: [['creeLe', 'DESC']], distinct: true,
  });
  return paginateResult(count, rows, p, l);
};

const getProductById = async (id) => {
  const product = await Product.findByPk(id, { include: INCLUDE });
  if (!product) throw { status: 404, message: 'Produit introuvable' };
  return product;
};

const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) throw { status: 404, message: 'Produit introuvable' };
  const allowed = ['nom', 'description', 'prix', 'stock', 'estActif', 'categorieId'];
  const updates = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
  await product.update(updates);
  return product.reload({ include: INCLUDE });
};

const deleteProduct = async (id) => {
  const product = await Product.findByPk(id, {
    include: [{ model: ProductImage, as: 'images' }],
  });
  if (!product) throw { status: 404, message: 'Produit introuvable' };

  await Promise.all(
    product.images
      .filter(img => img.idPublic)
      .map(img => deleteFromCloudinary(img.idPublic).catch(() => {}))
  );
  await product.destroy();
};

const toggleStatus = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw { status: 404, message: 'Produit introuvable' };
  await product.update({ estActif: !product.estActif });
  return { estActif: product.estActif };
};

module.exports = { getAllProducts, getProductById, updateProduct, deleteProduct, toggleStatus };
