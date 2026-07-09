// ─────────────────────────────────────────────────────────────
// middlewares/validate.middleware.js — Validation Joi centralisée
// Propage les erreurs au Global Error Handler via next(err)
// pour garantir un format de réponse uniforme.
// ─────────────────────────────────────────────────────────────
const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) return next(error);

    req[source] = value;
    next();
  };

module.exports = validate;
