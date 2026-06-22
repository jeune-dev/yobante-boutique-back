const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { authenticate }        = require('../middlewares/auth.middleware');
const { authLimiter }         = require('../middlewares/rateLimit.middleware');
const { validate }            = require('../middlewares/validate.middleware');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules } = require('../validations/auth.validation');

router.post('/register',          authLimiter, registerRules,       validate, ctrl.register);
router.post('/login',             authLimiter, loginRules,          validate, ctrl.login);
router.post('/refresh',                        ctrl.refreshToken);
router.post('/logout',            authenticate,                              ctrl.logout);
router.post('/forgot-password',   authLimiter, forgotPasswordRules, validate, ctrl.forgotPassword);
router.post('/reset-password',    authLimiter, resetPasswordRules,  validate, ctrl.resetPassword);

module.exports = router;
