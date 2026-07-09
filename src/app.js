const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const openapiSpec = require('./docs/openapi');
const { corsConfig } = require('./config/security');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const correlationId = require('./middlewares/correlationId.middleware');
const requestLogger = require('./middlewares/requestLogger.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.set('trust proxy', 1);

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Observabilité ─────────────────────────────────────────────────────────────
app.use(correlationId);
app.use(requestLogger);

// ── Sécurité ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsConfig));
app.use(globalLimiter);

// ── Parsers (2mb max — 10mb est un vecteur DoS) ───────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ── API Documentation ─────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// ── Routes /api/v1 ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/admin', require('./routes/admin/index'));
app.use('/api/v1/vendeur', require('./routes/vendeur/index'));
app.use('/api/v1/produits', require('./routes/client/produit.route'));
app.use('/api/v1/panier', require('./routes/client/panier.route'));
app.use('/api/v1/commandes', require('./routes/client/commande.route'));
app.use('/api/v1/avis', require('./routes/client/avis.route'));
app.use('/api/v1/profile', require('./routes/client/profil.route'));
app.use('/api/v1/bannieres', require('./routes/client/banniere.route'));
app.use('/api/v1/promotions', require('./routes/client/promotion.route'));
app.use('/api/v1/frais-livraisons', require('./routes/client/frais-livraison.route'));

// ── Rétrocompatibilité : redirige /api/* → /api/v1/* ─────────────────────────
app.use('/api', (req, res) => {
  res.redirect(301, `/api/v1${req.url}`);
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable', path: _req.path });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
