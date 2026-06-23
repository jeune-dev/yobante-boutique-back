// ─────────────────────────────────────────────────────────────
// routes/client/profil.route.js   — Préfixe : /api/client/profil
// ─────────────────────────────────────────────────────────────
// const router = require('express').Router()
// const ctrl = require('../../controllers/client/profil.controller')
// const { auth } = require('../../middlewares/auth.middleware')
// const { validate } = require('../../middlewares/validate.middleware')
// const { upload } = require('../../middlewares/upload.middleware')

// GET    /api/client/profil                     -> ctrl.get            [auth]
// PUT    /api/client/profil                     -> ctrl.update         [auth, validate]
// PATCH  /api/client/profil/avatar              -> ctrl.updateAvatar   [auth, upload.single('avatar')]
// GET    /api/client/profil/adresses            -> ctrl.getAdresses    [auth]
// POST   /api/client/profil/adresses            -> ctrl.ajouterAdresse [auth, validate]
// PUT    /api/client/profil/adresses/:id        -> ctrl.updateAdresse  [auth, validate]
// DELETE /api/client/profil/adresses/:id        -> ctrl.supprimerAdresse[auth]
// PATCH  /api/client/profil/adresses/:id/default-> ctrl.setDefault     [auth]

// module.exports = router
