const router = require('express').Router();
const ctrl = require('../../controllers/client/banniere.controller');

// Route publique — accessible sans authentification
router.get('/', ctrl.getActives);

module.exports = router;
