// ─────────────────────────────────────────────────────────────
// middlewares/validate.middleware.js
// ─────────────────────────────────────────────────────────────

// TODO: validate(schema, target='body')
//   - Retourner une fonction middleware (req, res, next)
//   - Valider req[target] contre le schéma Joi fourni
//   - Options Joi : { abortEarly: false, stripUnknown: true }
//   - Si erreur : retourner 400 avec la liste des messages d'erreur
//   - Si succès : remplacer req[target] par la valeur validée et appeler next()
