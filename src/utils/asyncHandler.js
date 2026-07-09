// ─────────────────────────────────────────────────────────────
// utils/asyncHandler.js — Wrapper async pour Express routes
// Élimine le try/catch boilerplate dans chaque controller.
// Les erreurs sont propagées au Global Error Handler (error.middleware.js).
// ─────────────────────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
