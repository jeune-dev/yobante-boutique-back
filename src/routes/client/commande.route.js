const router = require('express').Router();
const ctrl = require('../../controllers/client/commande.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { passerCommandeSchema } = require('../../validations/commande.validation');

router.get('/', auth, ctrl.getMes);
router.post('/', auth, validate(passerCommandeSchema), ctrl.passer);
router.get('/:id', auth, ctrl.getOne);
router.patch('/:id/annuler', auth, ctrl.annuler);

module.exports = router;
