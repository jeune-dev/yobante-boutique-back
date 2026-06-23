// ─────────────────────────────────────────────────────────────
// middlewares/checkActiveUser.middleware.js
// ─────────────────────────────────────────────────────────────

// TODO: checkActiveUser(req, res, next)
//   - Vérifier que req.user.isActive === true
//   - Si non : retourner 403 avec message 'Votre compte a été désactivé'
//   - Si oui : appeler next()
//   - Ce middleware s'utilise après auth.middleware
