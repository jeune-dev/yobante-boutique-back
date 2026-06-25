const router = require('express').Router();
const ctrl = require('../../controllers/admin/user.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { admin } = require('../../middlewares/admin.middleware');

router.get('/', auth, admin, ctrl.getAll);
router.get('/export', auth, admin, ctrl.exportUsers);
router.get('/:id', auth, admin, ctrl.getOne);
router.patch('/:id/bloquer', auth, admin, ctrl.bloquer);
router.patch('/:id/activer', auth, admin, ctrl.activer);
router.delete('/:id', auth, admin, ctrl.remove);

module.exports = router
