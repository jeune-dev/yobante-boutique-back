require('dotenv').config();

const sequelize = require('./config/db');
const logger = require('./config/logger');
const app = require('./app');

// Charger les associations Sequelize
const {
  User, Categorie, Produit, Adresse, Commande, CommandeItem,
  Paiement, Panier, Avis, RefreshToken, UserOtp,
} = require('./models');

const PORT = process.env.PORT || 5000;

/**
 * Application server startup
 * Gère:
 * - Connexion DB
 * - Synchronisation modèles (avec ordre: parent → enfant)
 * - Seeding admin (si première fois)
 * - Écoute serveur
 */
async function startServer() {
  try {
    // ── 1. Connexion PostgreSQL ────────────────────────────────────────
    await sequelize.authenticate();
    logger.info('✅ Connexion PostgreSQL établie');

    // ── 2. Synchronisation Modèles ─────────────────────────────────────
    // En production: force:false (sûr) / En dev: alter:true (ajoute colonnes)
    // JAMAIS force:true en prod — détruit toutes les tables!
    const isProd = process.env.NODE_ENV === 'production';
    const syncOptions = isProd ? { force: false } : { alter: true };

    // IMPORTANT: ordre explicite, tables parents avant enfants avec FKs.
    // Sinon: "SequelizeForeignKeyConstraintError: insert or update on table "..." violates foreign key constraint"
    await User.sync(syncOptions);
    await Categorie.sync(syncOptions);
    await Produit.sync(syncOptions);        // dépend de Categorie
    await Adresse.sync(syncOptions);        // dépend de User
    await Commande.sync(syncOptions);       // dépend de User, Adresse
    await CommandeItem.sync(syncOptions);   // dépend de Commande, Produit
    await Paiement.sync(syncOptions);       // dépend de Commande, User
    await Panier.sync(syncOptions);         // dépend de User, Produit
    await Avis.sync(syncOptions);           // dépend de User, Produit
    await RefreshToken.sync(syncOptions);   // dépend de User
    await UserOtp.sync(syncOptions);        // dépend de User
    logger.info('✅ Modèles synchronisés avec la base de données');

    // ── 3. Seeding données initiales ────────────────────────────────────
    const seedAdmin = require('./seeders/adminSeeder');
    await seedAdmin();
    logger.info('✅ Seed admin vérifié');

    // ── 4. Écoute du serveur ───────────────────────────────────────────
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Serveur lancé sur le port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

  } catch (err) {
    logger.error('💥 Erreur au démarrage', { 
      error: err.message, 
      stack: err.stack 
    });
    process.exit(1);
  }
}

// ── Gestion des erreurs non capturées ──────────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error('⚠️  Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('⚠️  Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Démarrer le serveur
startServer();

module.exports = app;
