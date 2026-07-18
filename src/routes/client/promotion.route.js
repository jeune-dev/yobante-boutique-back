const router = require('express').Router();
const ctrl = require('../../controllers/client/promotion.controller');

// Routes publiques — accessibles sans authentification
router.get('/', ctrl.getSections);
// ⚠️ Doit être déclarée AVANT '/:section' pour ne pas être capturée comme section.
router.get('/actives', ctrl.getActives);
router.get('/groupees', ctrl.getGroupees);
router.get('/:section', ctrl.getSection);

module.exports = router;
