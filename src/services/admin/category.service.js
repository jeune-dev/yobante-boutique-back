const { Category, Product } = require('../../models');
const { slugify, uniqueSlug } = require('../../utils/slugify');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../middlewares/uploadService');

const buildSlug = async (nom, excludeId = null) => {
  let slug = slugify(nom);
  const existing = await Category.findOne({ where: { slug } });
  if (existing && existing.id !== excludeId) slug = uniqueSlug(nom, Date.now());
  return slug;
};

const getAllCategories = async () => {
  return Category.findAll({
    where: { parentId: null },
    include: [{ model: Category, as: 'sousCategories', where: { estActif: true }, required: false }],
    order: [['nom', 'ASC']],
  });
};

const getCategoryById = async (id) => {
  const cat = await Category.findByPk(id, {
    include: [{ model: Category, as: 'sousCategories' }],
  });
  if (!cat) throw { status: 404, message: 'Catégorie introuvable' };
  return cat;
};

const createCategory = async ({ nom, description, parentId }, file) => {
  const slug = await buildSlug(nom);
  const data = { nom, slug, description, parentId: parentId || null };

  if (file) {
    const result = await uploadToCloudinary(file.buffer, 'yobante/categories');
    data.image        = result.secure_url;
    data.imageIdPublic = result.public_id;
  }

  return Category.create(data);
};

const updateCategory = async (id, { nom, description, parentId, estActif }, file) => {
  const cat = await Category.findByPk(id);
  if (!cat) throw { status: 404, message: 'Catégorie introuvable' };

  const updates = {};
  if (nom !== undefined)      { updates.nom = nom; updates.slug = await buildSlug(nom, id); }
  if (description !== undefined) updates.description = description;
  if (parentId    !== undefined) updates.parentId    = parentId || null;
  if (estActif    !== undefined) updates.estActif    = estActif;

  if (file) {
    if (cat.imageIdPublic) await deleteFromCloudinary(cat.imageIdPublic).catch(() => {});
    const result = await uploadToCloudinary(file.buffer, 'yobante/categories');
    updates.image        = result.secure_url;
    updates.imageIdPublic = result.public_id;
  }

  await cat.update(updates);
  return cat;
};

const deleteCategory = async (id) => {
  const cat = await Category.findByPk(id);
  if (!cat) throw { status: 404, message: 'Catégorie introuvable' };

  const count = await Product.count({ where: { categorieId: id } });
  if (count > 0) throw { status: 400, message: `Impossible de supprimer : ${count} produit(s) liés` };

  if (cat.imageIdPublic) await deleteFromCloudinary(cat.imageIdPublic).catch(() => {});
  await cat.destroy();
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
