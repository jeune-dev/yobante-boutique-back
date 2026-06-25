// ─────────────────────────────────────────────────────────────
// middlewares/error.middleware.js — Gestionnaire global d'erreurs
// ─────────────────────────────────────────────────────────────

// TODO: errorMiddleware(err, req, res, next)
//   - Logger l'erreur avec winston (sans données sensibles)
//   - Si err.isJoi ou err.name === 'ValidationError' : retourner 400
//   - Si err.name === 'UnauthorizedError' ou err.status === 401 : retourner 401
//   - Si err.status === 403 : retourner 403
//   - Si err.status === 404 : retourner 404
//   - Si err.name === 'SequelizeUniqueConstraintError' : retourner 409
//   - Par défaut : retourner 500 sans exposer le stack trace en production
//   - Format de réponse : { success: false, message: '...', errors: [...] }

// module.exports = errorMiddleware
