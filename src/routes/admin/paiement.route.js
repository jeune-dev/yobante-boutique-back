const router = require('express').Router();
const ctrl = require('../../controllers/admin/paiement.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { admin } = require('../../middlewares/admin.middleware');

router.get('/', auth, admin, ctrl.getAll);
router.get('/:id', auth, admin, ctrl.getOne);
router.patch('/:id/rembourser', auth, admin, ctrl.rembourser);

module.exports = router
