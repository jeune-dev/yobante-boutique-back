const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const openapiSpec = require('./docs/openapi');
const { corsConfig } = require('./config/security');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// ── Trust proxy (important pour déploiement Render / proxies) ──────────────────
app.set('trust proxy', 1);

// ── Sécurité ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsConfig));
app.use(globalLimiter);

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * Health check — utilisé par les orchestrateurs (Render, Docker, K8s)
 */
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Documentation — Swagger/OpenAPI
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

/**
 * Auth routes (publiques)
 */
app.use('/api/auth', require('./routes/auth.routes'));

/**
 * Admin routes (protégées)
 */
app.use('/api/admin', require('./routes/admin/index'));

/**
 * Client/Shop routes (publiques et partiellement protégées)
 */
app.use('/api/produits', require('./routes/client/produit.route'));
app.use('/api/panier', require('./routes/client/panier.route'));
app.use('/api/commandes', require('./routes/client/commande.route'));
app.use('/api/avis', require('./routes/client/avis.route'));
app.use('/api/profile', require('./routes/client/profil.route'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route introuvable',
    path: _req.path
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
