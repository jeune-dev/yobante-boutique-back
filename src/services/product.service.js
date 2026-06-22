const { Op } = require('sequelize');
const { Product, ProductImage, Category, User } = require('../models');
const { getPagination, paginateResult } = require('../utils/pagination');

const PRODUCT_INCLUDE = [
  { model: ProductImage, as: 'images', attributes: ['id', 'url', 'estPrimaire', 'ordre'] },
  { model: Category,     as: 'categorie', attributes: ['id', 'nom', 'slug'] },
  { model: User,         as: 'vendeur',   attributes: ['id', 'nom', 'prenom'] },
];

const getProducts = async ({ page, limit, search, categorieId } = {}) => {
  const { limit: l, offset, page: p } = getPagination(page, limit);

  const where = { estActif: true };
  if (search)      where.nom        = { [Op.iLike]: `%${search}%` };
  if (categorieId) where.categorieId = categorieId;

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: PRODUCT_INCLUDE,
    limit: l, offset,
    order: [['creeLe', 'DESC']],
    distinct: true,
  });

  return paginateResult(count, rows, p, l);
};

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({
    where: { slug, estActif: true },
    include: PRODUCT_INCLUDE,
  });
  if (!product) throw { status: 404, message: 'Produit introuvable' };
  return product;
};

const getProductsByCategory = async (categorySlug, { page, limit } = {}) => {
  const categorie = await Category.findOne({ where: { slug: categorySlug, estActif: true } });
  if (!categorie) throw { status: 404, message: 'Catégorie introuvable' };

  const { limit: l, offset, page: p } = getPagination(page, limit);
  const { count, rows } = await Product.findAndCountAll({
    where: { categorieId: categorie.id, estActif: true },
    include: PRODUCT_INCLUDE,
    limit: l, offset,
    order: [['creeLe', 'DESC']],
    distinct: true,
  });

  return { categorie, ...paginateResult(count, rows, p, l) };
};

module.exports = { getProducts, getProductBySlug, getProductsByCategory };
