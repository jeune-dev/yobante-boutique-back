const router  = require('express').Router();
const ctrl    = require('../controllers/profile.controller');
const { authenticate }       = require('../middlewares/auth.middleware');
const { checkActiveUser }    = require('../middlewares/checkActiveUser.middleware');
const upload                 = require('../middlewares/upload.middleware');
const { validate }           = require('../middlewares/validate.middleware');
const { changePasswordRules } = require('../validations/auth.validation');

router.use(authenticate, checkActiveUser);

router.get('/',           ctrl.getProfile);
router.put('/',           upload.single('avatar'), ctrl.updateProfile);
router.put('/password',   changePasswordRules, validate, ctrl.changePassword);

module.exports = router;
