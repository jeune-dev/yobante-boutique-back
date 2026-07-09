const router = require('express').Router();
const adminMiddleware = require('../../middlewares/admin.middleware');
const ctrl = require('../../controllers/admin/vendeur.controller');

router.use(adminMiddleware);

router.get('/', ctrl.listerVendeurs);
router.post('/', ctrl.creerVendeur);
router.get('/:id', ctrl.getVendeur);
router.put('/:id', ctrl.updateProfil);
router.patch('/:id/valider-step1', ctrl.validerStep1);
router.patch('/:id/valider-step2', ctrl.validerStep2);
router.patch('/:id/rejeter', ctrl.rejeterVendeur);
router.patch('/:id/toggle', ctrl.toggleActivation);

module.exports = router;
