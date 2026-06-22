const router = require('express').Router();
const ctrl   = require('../../controllers/admin/category.controller');
const upload = require('../../middlewares/upload.middleware');
const { validate }                                  = require('../../middlewares/validate.middleware');
const { createCategoryRules, updateCategoryRules }  = require('../../validations/category.validation');

router.get('/',         ctrl.getAllCategories);
router.get('/:id',      ctrl.getCategoryById);
router.post('/',        upload.single('image'), createCategoryRules, validate, ctrl.createCategory);
router.put('/:id',      upload.single('image'), updateCategoryRules, validate, ctrl.updateCategory);
router.delete('/:id',   ctrl.deleteCategory);

module.exports = router;
