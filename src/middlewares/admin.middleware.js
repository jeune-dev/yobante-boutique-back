// ─────────────────────────────────────────────────────────────
// middlewares/admin.middleware.js
// ─────────────────────────────────────────────────────────────

// TODO: admin(req, res, next)
//   - Vérifier que req.user existe (auth.middleware doit être appelé avant)
//   - Vérifier que req.user.role === 'admin'
//   - Si non : retourner 403 avec message 'Accès refusé'
//   - Si oui : appeler next()
