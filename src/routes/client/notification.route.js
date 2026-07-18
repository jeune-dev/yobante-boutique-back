// ─────────────────────────────────────────────────────────────
// routes/client/notification.route.js   — Préfixe : /api/v1/notifications
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/client/notification.controller');
const auth = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');

router.use(auth, checkActiveUser);

router.get('/', ctrl.lister);
router.get('/non-lues', ctrl.compterNonLues);
router.patch('/toutes-lues', ctrl.toutMarquerLu);
router.patch('/:id/lire', ctrl.marquerLue);

module.exports = router;
