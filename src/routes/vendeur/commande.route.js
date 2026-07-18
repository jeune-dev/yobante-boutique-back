const router = require('express').Router();
const vendeurMiddleware = require('../../middlewares/vendeur.middleware');
const ctrl = require('../../controllers/vendeur/commande.controller');

router.use(vendeurMiddleware);

router.get('/ventes', ctrl.getVentes);
router.get('/', ctrl.getMesCommandes);
router.get('/:id', ctrl.getOne);

module.exports = router;
