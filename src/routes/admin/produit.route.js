// ─────────────────────────────────────────────────────────────
// routes/admin/produit.route.js   — Préfixe : /api/admin/produits
// ─────────────────────────────────────────────────────────────
// const router = require('express').Router()
// const ctrl = require('../../controllers/admin/produit.controller')
// const { auth } = require('../../middlewares/auth.middleware')
// const { admin } = require('../../middlewares/admin.middleware')
// const { upload } = require('../../middlewares/upload.middleware')

// GET    /api/admin/produits               -> ctrl.getAll          [auth, admin]
// POST   /api/admin/produits               -> ctrl.create          [auth, admin, upload.array('images',5)]
// POST   /api/admin/produits/import        -> ctrl.importProduits  [auth, admin, upload.single('file')]
// GET    /api/admin/produits/:id           -> ctrl.getOne          [auth, admin]
// PUT    /api/admin/produits/:id           -> ctrl.update          [auth, admin, upload.array('images',5)]
// DELETE /api/admin/produits/:id           -> ctrl.remove          [auth, admin]
// PATCH  /api/admin/produits/:id/stock     -> ctrl.updateStock     [auth, admin]
// PATCH  /api/admin/produits/:id/featured  -> ctrl.toggleFeatured  [auth, admin]
// PATCH  /api/admin/produits/:id/visibilite-> ctrl.toggleVisibilite[auth, admin]

// module.exports = router
