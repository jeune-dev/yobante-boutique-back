// ─────────────────────────────────────────────────────────────
// routes/client/commande.route.js   — Préfixe : /api/commandes
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/client/commande.controller');
const auth = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');
const validate = require('../../middlewares/validate.middleware');
const { passerCommandeSchema } = require('../../validations/commande.validation');

router.use(auth, checkActiveUser);

router.get('/',              ctrl.getMes);
router.post('/',             validate(passerCommandeSchema), ctrl.passer);
router.get('/:id',           ctrl.getOne);
router.patch('/:id/annuler', ctrl.annuler);

module.exports = router;
