const router = require('express').Router();
const ctrl = require('../../controllers/admin/categorie.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { admin } = require('../../middlewares/admin.middleware');

router.get('/', auth, admin, ctrl.getAll);
router.post('/', auth, admin, ctrl.create);
router.get('/:id', auth, admin, ctrl.getOne);
router.put('/:id', auth, admin, ctrl.update);
router.delete('/:id', auth, admin, ctrl.remove);

module.exports = router
