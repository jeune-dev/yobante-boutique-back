const router = require('express').Router();
const adminMiddleware = require('../../middlewares/admin.middleware');
const upload = require('../../middlewares/upload.middleware');
const ctrl = require('../../controllers/admin/blocPromo.controller');

router.use(adminMiddleware);

router.get('/', ctrl.getAll);
router.put('/:section', upload.single('image'), ctrl.updateBySection);

module.exports = router;
