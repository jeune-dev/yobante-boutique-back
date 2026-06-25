const router = require('express').Router();
const ctrl = require('../../controllers/client/avis.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { avisSchema } = require('../../validations/avis.validation');

router.get('/', auth, ctrl.getMes);
router.post('/', auth, validate(avisSchema), ctrl.poster);
router.delete('/:id', auth, ctrl.supprimer);

module.exports = router;
