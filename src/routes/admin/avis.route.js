const router = require('express').Router();
const ctrl = require('../../controllers/admin/avis.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { admin } = require('../../middlewares/admin.middleware');

router.get('/', auth, admin, ctrl.getAll);
router.patch('/:id/approuver', auth, admin, ctrl.approuver);
router.delete('/:id', auth, admin, ctrl.remove);

module.exports = router
