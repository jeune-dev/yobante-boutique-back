const router = require('express').Router();
const { authenticate }    = require('../../middlewares/auth.middleware');
const { checkActiveUser } = require('../../middlewares/checkActiveUser.middleware');
const { isAdmin }         = require('../../middlewares/admin.middleware');

router.use(authenticate, checkActiveUser, isAdmin);

router.use('/users',      require('./user.routes'));
router.use('/categories', require('./category.routes'));
router.use('/products',   require('./product.routes'));
router.use('/orders',     require('./order.routes'));

module.exports = router;
