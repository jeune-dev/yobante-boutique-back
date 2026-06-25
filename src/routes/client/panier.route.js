const router = require('express').Router();
const ctrl = require('../../controllers/client/panier.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { ajouterPanierSchema, modifierPanierSchema } = require('../../validations/commande.validation');

router.get('/', auth, ctrl.getPanier);
router.post('/', auth, validate(ajouterPanierSchema), ctrl.ajouter);
router.put('/:produitId', auth, validate(modifierPanierSchema), ctrl.modifier);
router.delete('/:produitId', auth, ctrl.retirer);
router.delete('/', auth, ctrl.vider);

module.exports = router;
