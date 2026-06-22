const router = require('express').Router();
const ctrl   = require('../../controllers/admin/order.controller');
const { validate }           = require('../../middlewares/validate.middleware');
const { updateStatutRules }  = require('../../validations/order.validation');

router.get('/',              ctrl.getAllOrders);
router.get('/:id',           ctrl.getOrderById);
router.patch('/:id/status',  updateStatutRules, validate, ctrl.updateOrderStatus);

module.exports = router;
