const router = require('express').Router();
const ctrl = require('../../controllers/admin/commande.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { admin } = require('../../middlewares/admin.middleware');

router.get('/', auth, admin, ctrl.getAll);
router.get('/export', auth, admin, ctrl.exportCommandes);
router.get('/:id', auth, admin, ctrl.getOne);
router.patch('/:id/valider', auth, admin, ctrl.valider);
router.patch('/:id/rejeter', auth, admin, ctrl.rejeter);
router.patch('/:id/preparation', auth, admin, ctrl.mettreEnPreparation);
router.patch('/:id/expedier', auth, admin, ctrl.marquerExpediee);
router.patch('/:id/livrer', auth, admin, ctrl.marquerLivree);

module.exports = router
