// ─────────────────────────────────────────────────────────────
// routes/client/deviceToken.route.js   — Préfixe : /api/v1/device-token
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/client/notification.controller');
const auth = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');

router.use(auth, checkActiveUser);

router.post('/register', ctrl.enregistrerAppareil);
router.post('/unregister', ctrl.supprimerAppareil);

module.exports = router;
