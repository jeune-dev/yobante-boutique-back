// ─────────────────────────────────────────────────────────────
// routes/client/panier.route.js   — Préfixe : /api/panier
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/client/panier.controller');
const auth = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');
const validate = require('../../middlewares/validate.middleware');
const {
  ajouterPanierSchema,
  modifierPanierSchema,
} = require('../../validations/panier.validation');

router.use(auth, checkActiveUser);

router.get('/', ctrl.getPanier);
router.post('/', validate(ajouterPanierSchema), ctrl.ajouter);
router.put('/:produitId', validate(modifierPanierSchema), ctrl.modifier);
router.delete('/:produitId', ctrl.retirer);
router.delete('/', ctrl.vider);

module.exports = router;
