const router = require('express').Router();
const ctrl = require('../../controllers/client/promotion.controller');

// Routes publiques — accessibles sans authentification
router.get('/', ctrl.getSections);
// ⚠️ Doit être déclarée AVANT '/:section' pour ne pas être capturée comme section.
router.get('/actives', ctrl.getActives);
router.get('/groupees', ctrl.getGroupees);
// Blocs (sous-sections) affichés en tête de chaque section de l'accueil.
// Le contrôleur existait déjà mais n'était rattaché à aucune route : l'appel
// tombait sur '/:section' et repartait en 400.
router.get('/blocs', ctrl.getBlocs);
router.get('/:section', ctrl.getSection);

module.exports = router;
