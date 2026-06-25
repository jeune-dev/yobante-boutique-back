const router = require('express').Router();
const ctrl = require('../controllers/client/paiement.controller');
const { auth } = require('../middlewares/auth.middleware');

router.post('/commandes/:commandeId/payer', auth, ctrl.initier);
router.post('/webhook', ctrl.webhook);
router.get('/return', ctrl.retour);
router.get('/cancel', ctrl.annulation);

module.exports = router;
