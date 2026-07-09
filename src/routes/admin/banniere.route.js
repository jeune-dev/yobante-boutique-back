const router = require('express').Router();
const adminMiddleware = require('../../middlewares/admin.middleware');
const upload = require('../../middlewares/upload.middleware');
const ctrl = require('../../controllers/admin/banniere.controller');

router.use(adminMiddleware);

router.get('/', ctrl.getAll);
router.post('/', upload.single('image'), ctrl.create);
router.put('/:id', upload.single('image'), ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/toggle', ctrl.toggleActive);
router.post('/reordonner', ctrl.reordonner);

module.exports = router;
