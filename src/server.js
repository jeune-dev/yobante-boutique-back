require('dotenv').config();

const sequelize = require('./config/db');
const logger = require('./config/logger');
const app = require('./app');

// Charge les modèles pour initialiser les associations Sequelize
require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Connexion PostgreSQL établie');

    const seedAdmin = require('./seeders/adminSeeder');
    await seedAdmin();
    logger.info('Seed admin vérifié');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Serveur lancé sur le port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (err) {
    logger.error('Erreur au démarrage', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  // Log only — ne pas tuer le process pour les rejections dans les requêtes HTTP
  logger.error('Unhandled Rejection', { reason: String(reason) });
});

startServer();

module.exports = app;
