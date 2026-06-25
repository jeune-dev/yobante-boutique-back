const router = require('express').Router();
const ctrl = require('../../controllers/admin/dashboard.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { admin } = require('../../middlewares/admin.middleware');

router.get('/stats', auth, admin, ctrl.getStats);
router.get('/revenus', auth, admin, ctrl.getRevenus);
router.get('/top-produits', auth, admin, ctrl.getProduitsPlusVendus);
router.get('/stock-alertes', auth, admin, ctrl.getStockAlertes);

module.exports = router
