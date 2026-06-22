const router = require('express').Router();
const ctrl   = require('../../controllers/client/order.controller');
const { authenticate }       = require('../../middlewares/auth.middleware');
const { checkActiveUser }    = require('../../middlewares/checkActiveUser.middleware');
const { validate }           = require('../../middlewares/validate.middleware');
const { createOrderRules }   = require('../../validations/order.validation');

router.use(authenticate, checkActiveUser);

router.get('/',          ctrl.getMyOrders);
router.post('/',         createOrderRules, validate, ctrl.createOrder);
router.get('/:id',       ctrl.getMyOrderById);
router.patch('/:id/cancel', ctrl.cancelOrder);

module.exports = router;
