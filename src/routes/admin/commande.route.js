// ─────────────────────────────────────────────────────────────
// routes/admin/commande.route.js   — Préfixe : /api/admin/commandes
// ─────────────────────────────────────────────────────────────
// const router = require('express').Router()
// const ctrl = require('../../controllers/admin/commande.controller')
// const { auth } = require('../../middlewares/auth.middleware')
// const { admin } = require('../../middlewares/admin.middleware')

// GET    /api/admin/commandes                     -> ctrl.getAll             [auth, admin]
// GET    /api/admin/commandes/export              -> ctrl.exportCommandes     [auth, admin]
// GET    /api/admin/commandes/:id                 -> ctrl.getOne             [auth, admin]
// PATCH  /api/admin/commandes/:id/valider         -> ctrl.valider            [auth, admin]
// PATCH  /api/admin/commandes/:id/rejeter         -> ctrl.rejeter            [auth, admin]
// PATCH  /api/admin/commandes/:id/preparation     -> ctrl.mettreEnPreparation[auth, admin]
// PATCH  /api/admin/commandes/:id/expedier        -> ctrl.marquerExpediee    [auth, admin]
// PATCH  /api/admin/commandes/:id/livrer          -> ctrl.marquerLivree      [auth, admin]

// module.exports = router
