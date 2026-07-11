// ─────────────────────────────────────────────────────────────
// routes/admin/paiement.route.js   — Préfixe : /api/admin/paiements
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/admin/paiement.controller');
const adminMiddleware = require('../../middlewares/admin.middleware');

router.get('/', adminMiddleware, ctrl.getAll);
router.get('/revenus-total', adminMiddleware, ctrl.getRevenusTotal);
router.get('/:id', adminMiddleware, ctrl.getOne);
router.patch('/:id/confirmer', adminMiddleware, ctrl.confirmer);
router.patch('/:id/rembourser', adminMiddleware, ctrl.rembourser);

module.exports = router;
