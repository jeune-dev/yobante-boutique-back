// ─────────────────────────────────────────────────────────────
// routes/admin/avis.route.js   — Préfixe : /api/admin/avis
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/admin/avis.controller');
const adminMiddleware = require('../../middlewares/admin.middleware');

router.get('/',                adminMiddleware, ctrl.getAll);
router.patch('/:id/approuver', adminMiddleware, ctrl.approuver);
router.delete('/:id',          adminMiddleware, ctrl.remove);

module.exports = router;
