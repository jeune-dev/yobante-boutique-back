const router = require('express').Router();
const ctrl = require('../../controllers/client/boutique.controller');

// Route publique — liste des boutiques (profils vendeurs).
router.get('/', ctrl.liste);

module.exports = router;
