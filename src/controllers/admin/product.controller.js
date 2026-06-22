const productService = require('../../services/admin/product.service');
const { success, error } = require('../../utils/response');

const getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return success(res, product);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return success(res, product, 'Produit mis à jour');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    return success(res, null, 'Produit supprimé');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const toggleStatus = async (req, res) => {
  try {
    const result = await productService.toggleStatus(req.params.id);
    return success(res, result, 'Statut modifié');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getAllProducts, getProductById, updateProduct, deleteProduct, toggleStatus };
