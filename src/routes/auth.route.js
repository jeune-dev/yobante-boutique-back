// ─────────────────────────────────────────────────────────────
// routes/auth.route.js   — Préfixe : /api/auth
// ─────────────────────────────────────────────────────────────
// const router = require('express').Router()
// const authController = require('../controllers/auth.controller')
// const { validate } = require('../middlewares/validate.middleware')
// const { authRateLimitConfig } = require('../middlewares/rateLimit.middleware')

// POST   /api/auth/register          -> authController.register         [validate]
// POST   /api/auth/verify-email      -> authController.verifyEmail      [validate]
// POST   /api/auth/login             -> authController.login            [validate, rateLimitAuth]
// POST   /api/auth/refresh-token     -> authController.refreshToken
// POST   /api/auth/logout            -> authController.logout           [auth]
// POST   /api/auth/forgot-password   -> authController.forgotPassword   [rateLimitAuth]
// POST   /api/auth/reset-password    -> authController.resetPassword    [validate]
// PUT    /api/auth/change-password   -> authController.changePassword   [auth, validate]

// module.exports = router
