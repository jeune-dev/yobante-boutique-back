const productService = require('../../services/vendeur/product.service');
const { success, created, error } = require('../../utils/response');

const getMyProducts = async (req, res) => {
  try {
    const result = await productService.getMyProducts(req.user.id, req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.user.id, req.body, req.files || []);
    return created(res, product, 'Produit créé');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateMyProduct = async (req, res) => {
  try {
    const product = await productService.updateMyProduct(req.user.id, req.params.id, req.body, req.files || []);
    return success(res, product, 'Produit mis à jour');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteMyProduct = async (req, res) => {
  try {
    await productService.deleteMyProduct(req.user.id, req.params.id);
    return success(res, null, 'Produit supprimé');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getMyProducts, createProduct, updateMyProduct, deleteMyProduct };
