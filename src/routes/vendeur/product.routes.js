const router = require('express').Router();
const ctrl   = require('../../controllers/vendeur/product.controller');
const { authenticate }        = require('../../middlewares/auth.middleware');
const { checkActiveUser }     = require('../../middlewares/checkActiveUser.middleware');
const { isVendeur }           = require('../../middlewares/admin.middleware');
const upload                  = require('../../middlewares/upload.middleware');
const { validate }            = require('../../middlewares/validate.middleware');
const { createProductRules, updateProductRules } = require('../../validations/product.validation');

router.use(authenticate, checkActiveUser, isVendeur);

router.get('/',       ctrl.getMyProducts);
router.post('/',      upload.array('images', 8), createProductRules, validate, ctrl.createProduct);
router.put('/:id',    upload.array('images', 8), updateProductRules, validate, ctrl.updateMyProduct);
router.delete('/:id', ctrl.deleteMyProduct);

module.exports = router;
