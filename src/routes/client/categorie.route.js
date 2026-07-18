// ─────────────────────────────────────────────────────────────
// routes/client/categorie.route.js   — Préfixe : /api/v1/categories
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/client/categorie.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

module.exports = router;
