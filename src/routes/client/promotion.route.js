const router = require('express').Router();
const ctrl = require('../../controllers/client/promotion.controller');

// Routes publiques — accessibles sans authentification
router.get('/', ctrl.getSections);
router.get('/:section', ctrl.getSection);

module.exports = router;
