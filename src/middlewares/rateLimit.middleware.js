// ─────────────────────────────────────────────────────────────
// middlewares/rateLimit.middleware.js
// ─────────────────────────────────────────────────────────────

// TODO: importer express-rate-limit
// TODO: importer rateLimitConfig et authRateLimitConfig depuis ../config/security.js

// TODO: rateLimit = rateLimit(rateLimitConfig)
//   - Limite globale : 100 requêtes / 15 minutes par IP

// TODO: rateLimitAuth = rateLimit(authRateLimitConfig)
//   - Limite auth : 5 requêtes / 15 minutes par IP
//   - Message : 'Trop de tentatives. Veuillez réessayer dans 15 minutes.'

// module.exports = { rateLimit, rateLimitAuth }
