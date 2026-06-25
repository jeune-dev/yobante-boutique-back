const { Op } = require('sequelize');
const slugify = require('slugify');
const cloudinary = require('../../config/cloudinary');
const { Categorie } = require('../../models');
const { paginateResult } = require('../../utils/paginate');

async function createCategorie(data, file) {
  const baseSlug = slugify(data.nom || 'categorie', { lower: true, strict: true }).slice(0, 200);
  let slug = baseSlug;
  let i = 1;
  while (await Categorie.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  let image = null;
  if (file && file.buffer) {
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'yobante/categories' }, (err, res) => (err ? reject(err) : resolve(res)));
      require('streamifier').createReadStream(file.buffer).pipe(stream);
    });
    image = uploaded.secure_url;
  }

  const categorie = await Categorie.create({ nom: data.nom, slug, description: data.description || null, image, parentId: data.parentId || null });
  return categorie;
}

async function updateCategorie(id, data, file) {
  const categorie = await Categorie.findByPk(id);
  if (!categorie) throw Object.assign(new Error('Catégorie introuvable'), { status: 404 });
  if (data.nom && data.nom !== categorie.nom) {
    const baseSlug = slugify(data.nom, { lower: true, strict: true }).slice(0, 200);
    let slug = baseSlug;
    let i = 1;
    while (await Categorie.findOne({ where: { slug, id: { [Op.ne]: id } } })) {
      slug = `${baseSlug}-${i++}`;
    }
    categorie.slug = slug;
    categorie.nom = data.nom;
  }
  if (data.description !== undefined) categorie.description = data.description;
  if (data.parentId !== undefined) categorie.parentId = data.parentId;

  if (file && file.buffer) {
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'yobante/categories' }, (err, res) => (err ? reject(err) : resolve(res)));
      require('streamifier').createReadStream(file.buffer).pipe(stream);
    });
    categorie.image = uploaded.secure_url;
  }

  await categorie.save();
  return categorie;
}

async function deleteCategorie(id) {
  const categorie = await Categorie.findByPk(id);
  if (!categorie) throw Object.assign(new Error('Catégorie introuvable'), { status: 404 });
  categorie.isActive = false;
  await categorie.save();
  return { message: 'Catégorie désactivée' };
}

async function getAllCategories(pagination) {
  const { page, limit, offset } = pagination;
  const { rows, count } = await Categorie.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
  return { rows, count, totalPages: paginateResult(count, page, limit).totalPages };
}

async function getCategorieById(id) {
  const categorie = await Categorie.findByPk(id);
  if (!categorie) throw Object.assign(new Error('Catégorie introuvable'), { status: 404 });
  return categorie;
}

module.exports = { createCategorie, updateCategorie, deleteCategorie, getAllCategories, getCategorieById };
