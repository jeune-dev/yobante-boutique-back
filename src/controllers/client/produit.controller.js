const produitService = require('../../services/client/produit.service');
const { success } = require('../../utils/formatResponse');
const { paginate } = require('../../utils/paginate');

async function getCatalogue(req, res, next) {
  try {
    const pagination = paginate(req.query);
    const result = await produitService.getProduits(req.query, pagination);
    return success(res, result, 'Catalogue récupéré');
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const produit = await produitService.getProduitBySlug(req.params.slug);
    return success(res, produit, 'Produit récupéré');
  } catch (err) {
    next(err);
  }
}

async function getFeatured(req, res, next) {
  try {
    const produits = await produitService.getProduitsFeatured();
    return success(res, produits, 'Produits mis en avant récupérés');
  } catch (err) {
    next(err);
  }
}

async function getByCategorie(req, res, next) {
  try {
    const pagination = paginate(req.query);
    const result = await produitService.getProduitsByCategorie(req.params.slug, pagination);
    return success(res, result, 'Produits de catégorie récupérés');
  } catch (err) {
    next(err);
  }
}

async function rechercher(req, res, next) {
  try {
    const produits = await produitService.rechercherProduits(req.query.q);
    return success(res, produits, 'Résultats de recherche récupérés');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCatalogue,
  getOne,
  getFeatured,
  getByCategorie,
  rechercher,
};
