const rateLimit = require('express-rate-limit');

const _base = {
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
};

// 100 req / 15 min par IP — toutes routes confondues
const globalLimiter = rateLimit({
  ..._base,
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// 10 tentatives / 15 min — login + refresh (brute force)
const authLimiter = rateLimit({
  ..._base,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

// 5 inscriptions / heure par IP — anti-spam comptes
const registerLimiter = rateLimit({
  ..._base,
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Trop de créations de compte depuis cette adresse IP. Réessayez dans 1 heure.',
  },
});

// 3 demandes de reset / heure par IP
const forgotPasswordLimiter = rateLimit({
  ..._base,
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure.',
  },
});

// Upload : 20 req / 10 min (images)
const uploadLimiter = rateLimit({
  ..._base,
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Trop d'uploads. Réessayez dans 10 minutes." },
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  uploadLimiter,
};
