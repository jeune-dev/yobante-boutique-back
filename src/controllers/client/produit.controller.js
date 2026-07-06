/**
 * Produit Controller (Client)
 * Gère la consultation du catalogue de produits
 */
const ProduitService = require('../../services/client/produit.service');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../config/logger');

/**
 * GET /api/produits
 * Récupérer tous les produits avec filtres, recherche, pagination
 */
exports.getCatalogue = async (req, res) => {
  try {
    const result = await ProduitService.getProduits(req.query);
    return ApiResponse.success(200, res, 'Catalogue récupéré', {
      produits: result.produits,
      pagination: result.pagination
    });
  } catch (err) {
    logger.error('Erreur getCatalogue', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/produits/:slug
 * Récupérer un produit par son slug avec ses avis
 */
exports.getOne = async (req, res) => {
  try {
    const result = await ProduitService.getProduitBySlug(req.params.slug);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, 'Produit récupéré', {
      produit: result.produit,
      noteMoyenne: result.noteMoyenne
    });
  } catch (err) {
    logger.error('Erreur getOne produit', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/produits/featured
 * Récupérer les produits en vedette
 */
exports.getFeatured = async (req, res) => {
  try {
    const result = await ProduitService.getProduitsFeatured();
    return ApiResponse.success(200, res, 'Produits vedettes récupérés', {
      produits: result.produits
    });
  } catch (err) {
    logger.error('Erreur getFeatured', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/produits/categorie/:slug
 * Récupérer les produits d'une catégorie
 */
exports.getByCategorie = async (req, res) => {
  try {
    const result = await ProduitService.getProduitsByCategorie(req.params.slug, req.query);
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, 'Produits de la catégorie récupérés', {
      categorie: result.categorie,
      produits: result.produits,
      pagination: result.pagination
    });
  } catch (err) {
    logger.error('Erreur getByCategorie', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/produits/search?q=...
 * Rechercher des produits par nom
 */
exports.rechercher = async (req, res) => {
  try {
    const result = await ProduitService.rechercherProduits({
      query: req.query.q,
      page: req.query.page,
      limit: req.query.limit
    });
    return ApiResponse.success(200, res, 'Recherche effectuée', {
      produits: result.produits,
      pagination: result.pagination
    });
  } catch (err) {
    logger.error('Erreur rechercher produits', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};

/**
 * GET /api/produits/:id/recommandes
 * Récupérer les produits recommandés pour un produit
 */
exports.getRecommandes = async (req, res) => {
  try {
    const result = await ProduitService.getProduitsRecommandes(
      req.params.id,
      req.query.limit ? Number(req.query.limit) : 6
    );
    if (!result.success) {
      return ApiResponse.notFound(res, result.message);
    }
    return ApiResponse.success(200, res, 'Produits recommandés récupérés', {
      produits: result.produits
    });
  } catch (err) {
    logger.error('Erreur getRecommandes', { error: err.message });
    return ApiResponse.internalServerError(res);
  }
};
