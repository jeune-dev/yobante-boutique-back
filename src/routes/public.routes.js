const router = require('express').Router();
const ctrl   = require('../controllers/product.controller');

router.get('/products',                          ctrl.getProducts);
router.get('/products/:slug',                    ctrl.getProductBySlug);
router.get('/categories/:categorySlug/products', ctrl.getProductsByCategory);

module.exports = router;
