const router = require('express').Router();
const ctrl = require('../../controllers/client/frais-livraison.controller');

// Routes publiques — le client consulte les tarifs avant de commander
router.get('/', ctrl.getActifs);
router.get('/:ville', ctrl.getParVille);

module.exports = router;
