require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET;
const isProd = process.env.NODE_ENV === 'production';

// ── Validation secrets JWT ─────────────────────────────────────────────────
const missingSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_RESET_SECRET'].filter(
  (k) => !process.env[k]
);
if (missingSecrets.length) {
  throw new Error(`Variables d'environnement manquantes : ${missingSecrets.join(', ')}`);
}

if (
  JWT_SECRET === JWT_REFRESH_SECRET ||
  JWT_SECRET === JWT_RESET_SECRET ||
  JWT_REFRESH_SECRET === JWT_RESET_SECRET
) {
  throw new Error(
    'JWT_SECRET, JWT_REFRESH_SECRET et JWT_RESET_SECRET doivent tous être différents.'
  );
}

// ── Validation CORS en production ──────────────────────────────────────────
const _rawCorsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
if (isProd && _rawCorsOrigins.length === 0) {
  throw new Error('En production, CORS_ORIGIN doit être défini (ex: https://votre-frontend.com)');
}
if (isProd && _rawCorsOrigins.includes('*')) {
  throw new Error('CORS_ORIGIN=* est interdit en production. Définissez des origines explicites.');
}

// ── Validation credentials Admin en production ─────────────────────────
if (isProd) {
  if (!process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL === 'admin@yobante.com') {
    throw new Error('En production, changez ADMIN_EMAIL (valeur par défaut interdite)');
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'Admin1234!') {
    throw new Error('En production, changez ADMIN_PASSWORD (valeur par défaut interdite)');
  }
}

/**
 * Configuration JWT
 */
const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshSecret: JWT_REFRESH_SECRET,
  refreshExpiresIn: '7d',
  resetSecret: JWT_RESET_SECRET,
  resetExpiresIn: '1h',
};

/**
 * Configuration Bcrypt
 */
const bcryptConfig = {
  saltRounds: 12,
};

/**
 * Rate Limiting (anti brute force)
 */
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
};

const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' },
};

/**
 * CORS sécurisé
 */
const corsConfig = {
  origin: _rawCorsOrigins.length ? _rawCorsOrigins : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

/**
 * Cookies (si refresh token)
 */
const cookieConfig = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
};

/**
 * Upload fichiers (images produits, catégories, avatar)
 */
const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
};

/**
 * Chiffrement & Hash
 */
const cryptoConfig = {
  hashAlgorithm: 'sha256',
  encoding: 'hex',
};

module.exports = {
  jwtConfig,
  bcryptConfig,
  rateLimitConfig,
  authRateLimitConfig,
  corsConfig,
  cookieConfig,
  uploadConfig,
  cryptoConfig,
};
