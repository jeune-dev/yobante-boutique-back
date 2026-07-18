const router = require('express').Router();
const adminMiddleware = require('../../middlewares/admin.middleware');
const ctrl = require('../../controllers/admin/promotion.controller');

router.use(adminMiddleware);

router.get('/sections', ctrl.getParSection);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/toggle', ctrl.toggleActive);
router.post('/produit/:produitId', ctrl.creer);

module.exports = router;
