// ─────────────────────────────────────────────────────────────
// routes/vendeur/index.js   — Préfixe : /api/vendeur
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();

router.use('/produits', require('./produit.route'));
router.use('/profil', require('./profil.route'));

module.exports = router;
