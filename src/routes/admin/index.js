// ─────────────────────────────────────────────────────────────
// routes/admin/index.js   — Préfixe : /api/admin
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();

router.use('/categories', require('./categorie.route'));
router.use('/produits', require('./produit.route'));
router.use('/commandes', require('./commande.route'));
router.use('/paiements', require('./paiement.route'));
router.use('/avis', require('./avis.route'));
router.use('/dashboard', require('./dashboard.route'));
router.use('/users', require('./user.route'));
router.use('/vendeurs', require('./vendeur.route'));
router.use('/bannieres', require('./banniere.route'));
router.use('/promotions', require('./promotion.route'));
router.use('/frais-livraison', require('./frais-livraison.route'));

module.exports = router;
