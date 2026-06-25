const { Op } = require('sequelize');
const { Produit, Categorie, Avis } = require('../../models');
const { paginateResult } = require('../../utils/paginate');

function mapProduit(produit) {
  const data = produit.toJSON ? produit.toJSON() : produit;
  const avis = data.Avis || [];
  const noteMoyenne = avis.length
    ? Number((avis.reduce((sum, current) => sum + Number(current.note), 0) / avis.length).toFixed(1))
    : null;
  delete data.Avis;
  return { ...data, noteMoyenne, avisCount: avis.length };
}

function buildSort(sortBy, sortOrder) {
  const order = [];
  const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';

  if (sortBy === 'prix') {
    order.push(['prix', direction]);
  } else if (sortBy === 'date') {
    order.push(['createdAt', direction]);
  } else {
    order.push(['createdAt', 'DESC']);
  }

  return order;
}

async function getProduits(filters = {}, pagination) {
  const where = { isActive: true };

  if (filters.categorieId) {
    where.categorieId = Number(filters.categorieId);
  }

  if (filters.prixMin) {
    where.prix = { ...(where.prix || {}), [Op.gte]: Number(filters.prixMin) };
  }

  if (filters.prixMax) {
    where.prix = { ...(where.prix || {}), [Op.lte]: Number(filters.prixMax) };
  }

  if (filters.isFeatured === 'true' || filters.isFeatured === true) {
    where.isFeatured = true;
  }

  if (filters.search) {
    where[Op.or] = [
      { nom: { [Op.iLike]: `%${filters.search}%` } },
      { description: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  const { page, limit, offset } = pagination;
  const order = buildSort(filters.sortBy, filters.sortOrder);

  const { rows, count } = await Produit.findAndCountAll({
    where,
    include: [
      { model: Categorie, attributes: ['id', 'nom', 'slug'] },
      { model: Avis, where: { isApproved: true }, required: false },
    ],
    distinct: true,
    order,
    limit,
    offset,
  });

  return {
    rows: rows.map(mapProduit),
    count,
    totalPages: paginateResult(count, page, limit).totalPages,
  };
}

async function getProduitBySlug(slug) {
  const produit = await Produit.findOne({
    where: { slug, isActive: true },
    include: [
      { model: Categorie, attributes: ['id', 'nom', 'slug'] },
      { model: Avis, where: { isApproved: true }, required: false },
    ],
  });

  if (!produit) {
    const error = new Error('Produit introuvable');
    error.status = 404;
    throw error;
  }

  return mapProduit(produit);
}

async function getProduitsFeatured() {
  const produits = await Produit.findAll({
    where: { isActive: true, isFeatured: true },
    limit: 10,
    include: [{ model: Categorie, attributes: ['id', 'nom', 'slug'] }],
    order: [['createdAt', 'DESC']],
  });

  return produits.map((produit) => ({ ...produit.toJSON() }));
}

async function getProduitsByCategorie(slug, pagination) {
  const categorie = await Categorie.findOne({ where: { slug, isActive: true } });
  if (!categorie) {
    const error = new Error('Catégorie introuvable');
    error.status = 404;
    throw error;
  }

  const { page, limit, offset } = pagination;
  const { rows, count } = await Produit.findAndCountAll({
    where: { categorieId: categorie.id, isActive: true },
    include: [
      { model: Categorie, attributes: ['id', 'nom', 'slug'] },
      { model: Avis, where: { isApproved: true }, required: false },
    ],
    distinct: true,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    rows: rows.map(mapProduit),
    count,
    totalPages: paginateResult(count, page, limit).totalPages,
  };
}

async function rechercherProduits(query) {
  if (!query || String(query).trim() === '') {
    return [];
  }

  const produits = await Produit.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { nom: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
      ],
    },
    limit: 20,
    include: [{ model: Categorie, attributes: ['id', 'nom', 'slug'] }],
    order: [['createdAt', 'DESC']],
  });

  return produits.map((produit) => ({ ...produit.toJSON() }));
}

async function getProduitsRecommandes(produitId, limit = 6) {
  const produit = await Produit.findByPk(produitId);
  if (!produit) {
    return [];
  }

  const produits = await Produit.findAll({
    where: {
      categorieId: produit.categorieId,
      isActive: true,
      id: { [Op.ne]: produit.id },
    },
    limit,
    include: [{ model: Categorie, attributes: ['id', 'nom', 'slug'] }],
    order: [['createdAt', 'DESC']],
  });

  return produits.map((item) => ({ ...item.toJSON() }));
}

module.exports = {
  getProduits,
  getProduitBySlug,
  getProduitsFeatured,
  getProduitsByCategorie,
  rechercherProduits,
  getProduitsRecommandes,
};
