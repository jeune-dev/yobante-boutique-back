const VendeurProduitService = require('../../services/vendeur/produit.service');
const ApiResponse = require('../../utils/ApiResponse');

exports.soumettre = async (req, res) => {
  try {
    const result = await VendeurProduitService.soumettreProduit(req.user.id, req.body, req.files);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(201, res, result.message, { produit: result.produit });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getMesProduits = async (req, res) => {
  try {
    const result = await VendeurProduitService.getMesProduits(req.user.id, req.query);
    return ApiResponse.success(200, res, 'Mes produits', result);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await VendeurProduitService.getProduitById(req.user.id, req.params.id);
    if (!result.success) return ApiResponse.notFound(res, result.message);
    return ApiResponse.success(200, res, 'Produit', { produit: result.produit });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const result = await VendeurProduitService.updateProduit(
      req.user.id,
      req.params.id,
      req.body,
      req.files
    );
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { produit: result.produit });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock, stockAlloue } = req.body;
    const result = await VendeurProduitService.updateStock(
      req.user.id,
      req.params.id,
      stock,
      stockAlloue
    );
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message, { produit: result.produit });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.supprimer = async (req, res) => {
  try {
    const result = await VendeurProduitService.supprimerProduit(req.user.id, req.params.id);
    if (!result.success) return ApiResponse.badRequest(res, result.message);
    return ApiResponse.success(200, res, result.message);
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};

exports.getStats = async (req, res) => {
  try {
    const result = await VendeurProduitService.getStats(req.user.id);
    return ApiResponse.success(200, res, 'Statistiques', { stats: result.stats });
  } catch (err) {
    return ApiResponse.internalServerError(res, err.message);
  }
};
