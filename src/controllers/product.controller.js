const productService = require('../services/product.service');
const { success, error } = require('../utils/response');

const getProducts = async (req, res) => {
  try {
    const result = await productService.getProducts(req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    return success(res, product);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const result = await productService.getProductsByCategory(req.params.categorySlug, req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getProducts, getProductBySlug, getProductsByCategory };
