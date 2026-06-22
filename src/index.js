require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');

require('./models'); // charge les associations Sequelize

const sequelize = require('./config/db');
const logger    = require('./config/logger');
const { corsConfig } = require('./config/security');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Sécurité ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsConfig));
app.use(globalLimiter);

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api',              require('./routes/public.routes'));
app.use('/api/profile',      require('./routes/profile.routes'));
app.use('/api/admin',        require('./routes/admin/index'));
app.use('/api/vendeur/products', require('./routes/vendeur/product.routes'));
app.use('/api/commandes',    require('./routes/client/order.routes'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route introuvable' }));

// ── Gestion des erreurs ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur' });
});

// ── Démarrage ─────────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Connexion PostgreSQL établie');

    await sequelize.sync({ force: true }); // recrée les tables avec les nouveaux noms de colonnes
    logger.info('Modèles synchronisés');

    app.listen(PORT, () => logger.info(`Serveur démarré sur le port ${PORT}`));
  } catch (err) {
    logger.error('Impossible de démarrer le serveur', { error: err.message });
    process.exit(1);
  }
}

start();
