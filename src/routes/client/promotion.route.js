const router = require('express').Router();
const ctrl = require('../../controllers/client/promotion.controller');

// Routes publiques — accessibles sans authentification
router.get('/', ctrl.getSections);
// ⚠️ Doivent être déclarées AVANT '/:section' pour ne pas être capturées comme section.
router.get('/actives', ctrl.getActives);
router.get('/blocs', ctrl.getBlocs);
router.get('/:section', ctrl.getSection);

module.exports = router;
