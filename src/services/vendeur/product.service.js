const { Op } = require('sequelize');
const { Product, ProductImage, Category } = require('../../models');
const { getPagination, paginateResult } = require('../../utils/pagination');
const { slugify, uniqueSlug } = require('../../utils/slugify');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../middlewares/uploadService');

const INCLUDE = [
  { model: ProductImage, as: 'images',    order: [['ordre', 'ASC']] },
  { model: Category,     as: 'categorie', attributes: ['id', 'nom', 'slug'] },
];

const buildSlug = async (nom, excludeId = null) => {
  let slug = slugify(nom);
  const existing = await Product.findOne({ where: { slug } });
  if (existing && existing.id !== excludeId) slug = uniqueSlug(nom, Date.now());
  return slug;
};

const getMyProducts = async (vendeurId, { page, limit, search } = {}) => {
  const { limit: l, offset, page: p } = getPagination(page, limit);
  const where = { vendeurId };
  if (search) where.nom = { [Op.iLike]: `%${search}%` };

  const { count, rows } = await Product.findAndCountAll({
    where, include: INCLUDE, limit: l, offset,
    order: [['creeLe', 'DESC']], distinct: true,
  });
  return paginateResult(count, rows, p, l);
};

const createProduct = async (vendeurId, { nom, description, prix, stock, categorieId }, files = []) => {
  const slug    = await buildSlug(nom);
  const product = await Product.create({ nom, slug, description, prix, stock, categorieId: categorieId || null, vendeurId });

  if (files.length) {
    const uploads = await Promise.all(
      files.map((f, i) => uploadToCloudinary(f.buffer, 'yobante/products').then(r => ({
        produitId: product.id, url: r.secure_url, idPublic: r.public_id, estPrimaire: i === 0, ordre: i,
      })))
    );
    await ProductImage.bulkCreate(uploads);
  }

  return product.reload({ include: INCLUDE });
};

const updateMyProduct = async (vendeurId, id, data, files = []) => {
  const product = await Product.findOne({ where: { id, vendeurId } });
  if (!product) throw { status: 404, message: 'Produit introuvable ou non autorisé' };

  const allowed = ['nom', 'description', 'prix', 'stock', 'estActif', 'categorieId'];
  const updates = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
  if (updates.nom) updates.slug = await buildSlug(updates.nom, id);
  if (updates.categorieId === '') updates.categorieId = null;

  await product.update(updates);

  if (files.length) {
    const existing = await ProductImage.findAll({ where: { produitId: id } });
    await Promise.all(existing.filter(i => i.idPublic).map(i => deleteFromCloudinary(i.idPublic).catch(() => {})));
    await ProductImage.destroy({ where: { produitId: id } });

    const uploads = await Promise.all(
      files.map((f, i) => uploadToCloudinary(f.buffer, 'yobante/products').then(r => ({
        produitId: id, url: r.secure_url, idPublic: r.public_id, estPrimaire: i === 0, ordre: i,
      })))
    );
    await ProductImage.bulkCreate(uploads);
  }

  return product.reload({ include: INCLUDE });
};

const deleteMyProduct = async (vendeurId, id) => {
  const product = await Product.findOne({
    where: { id, vendeurId },
    include: [{ model: ProductImage, as: 'images' }],
  });
  if (!product) throw { status: 404, message: 'Produit introuvable ou non autorisé' };

  await Promise.all(
    product.images.filter(i => i.idPublic).map(i => deleteFromCloudinary(i.idPublic).catch(() => {}))
  );
  await product.destroy();
};

module.exports = { getMyProducts, createProduct, updateMyProduct, deleteMyProduct };
