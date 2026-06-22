const router = require('express').Router();
const ctrl   = require('../../controllers/admin/product.controller');
const { validate }          = require('../../middlewares/validate.middleware');
const { updateProductRules } = require('../../validations/product.validation');

router.get('/',               ctrl.getAllProducts);
router.get('/:id',            ctrl.getProductById);
router.put('/:id',            updateProductRules, validate, ctrl.updateProduct);
router.delete('/:id',         ctrl.deleteProduct);
router.patch('/:id/status',   ctrl.toggleStatus);

module.exports = router;
