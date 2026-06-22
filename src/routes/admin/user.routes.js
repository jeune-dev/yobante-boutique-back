const router = require('express').Router();
const ctrl   = require('../../controllers/admin/user.controller');

router.get('/',               ctrl.getAllUsers);
router.get('/:id',            ctrl.getUserById);
router.put('/:id',            ctrl.updateUser);
router.delete('/:id',         ctrl.deleteUser);
router.patch('/:id/status',   ctrl.toggleStatus);

module.exports = router;
