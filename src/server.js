require('dotenv').config();

const sequelize = require('./config/db');
const logger = require('./config/logger');
const app = require('./app');

// Initialise toutes les associations Sequelize
require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Connexion PostgreSQL établie');

    // En production les tables existent déjà — on évite sync() qui touche
    // les index système et peut crasher sur des catalogs corrompus.
    // force:false uniquement : jamais alter:true, car sur Postgres Sequelize
    // régénère à chaque boot un `ALTER COLUMN ... TYPE ... USING` invalide pour
    // les colonnes ENUM (ex. Produit.statutValidation). L'évolution de schéma
    // passe par les migrations Sequelize.
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false });
      logger.info('Modèles synchronisés avec la base de données');
    }

    const seedAdmin = require('./seeders/adminSeeder');
    await seedAdmin();
    logger.info('Seed admin vérifié');

    const seedBlocsPromo = require('./seeders/blocPromoSeeder');
    await seedBlocsPromo();
    logger.info('Seed blocs promo vérifié');

    // Démarrage du job de nettoyage des tokens expirés (chaque lundi à minuit)
    const { startCleanupJob } = require('./jobs/cleanupExpiredTokens.job');
    startCleanupJob();

    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Serveur lancé sur le port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    const shutdown = (signal) => {
      logger.info(`Signal ${signal} reçu — arrêt en cours…`);
      server.close(async () => {
        try {
          await sequelize.close();
        } catch (_err) {
          /* ignore */
        }
        logger.info('Connexion DB fermée proprement');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Arrêt forcé après 10s');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
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
  logger.error('Unhandled Rejection', { reason: String(reason) });
  process.exit(1);
});

startServer();

module.exports = app;
