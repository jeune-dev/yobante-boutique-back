// ─────────────────────────────────────────────────────────────
// middlewares/auth.middleware.js
// ─────────────────────────────────────────────────────────────

// TODO: auth(req, res, next)
//   - Extraire le Bearer token depuis req.headers.authorization
//   - Lever une erreur 401 si absent
//   - Vérifier et décoder le token avec jwt.verify(token, JWT_SECRET)
//   - Lever une erreur 401 si token invalide ou expiré
//   - Récupérer l'user en base depuis le payload (id)
//   - Vérifier que l'user existe et isActive=true
//   - Attacher l'user à req.user
//   - Appeler next()
