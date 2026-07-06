// ─────────────────────────────────────────────────────────────
// routes/client/avis.route.js   — Préfixe : /api/avis
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/client/avis.controller');
const auth = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');
const validate = require('../../middlewares/validate.middleware');
const { avisSchema, updateAvisSchema } = require('../../validations/avis.validation');

router.use(auth, checkActiveUser);

router.get('/',       ctrl.getMes);
router.post('/',      validate(avisSchema), ctrl.create);
router.put('/:id',    validate(updateAvisSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
