require('dotenv').config();

const sequelize = require('./config/db');
const logger = require('./config/logger');
const app = require('./app');

// Initialise toutes les associations Sequelize
const {
  User,
  Categorie,
  Produit,
  Adresse,
  Commande,
  CommandeItem,
  Paiement,
  Panier,
  Avis,
  RefreshToken,
  UserOtp,
  ProfilVendeur,
  Banniere,
  Promotion,
  FraisLivraison,
  Favori,
} = require('./models');

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Connexion PostgreSQL établie');

    // force:false partout — crée les tables manquantes sans jamais les altérer.
    // On n'utilise PAS alter:true : sur Postgres, Sequelize régénère à chaque boot
    // un `ALTER COLUMN ... TYPE ... USING` invalide pour les colonnes ENUM
    // (ex. Produit.statutValidation), ce qui fait planter tout redémarrage.
    // L'évolution de schéma passe par les migrations Sequelize.
    const syncOptions = { force: false };

    // Ordre explicite : tables parents avant enfants (FK constraints)
    await User.sync(syncOptions);
    await Categorie.sync(syncOptions);
    await Produit.sync(syncOptions);
    await Adresse.sync(syncOptions);
    await Commande.sync(syncOptions);
    await CommandeItem.sync(syncOptions);
    await Paiement.sync(syncOptions);
    await Panier.sync(syncOptions);
    await Avis.sync(syncOptions);
    await RefreshToken.sync(syncOptions);
    await UserOtp.sync(syncOptions);
    await ProfilVendeur.sync(syncOptions);
    await Banniere.sync(syncOptions);
    await Promotion.sync(syncOptions);
    await FraisLivraison.sync(syncOptions);
    await Favori.sync(syncOptions);

    logger.info('Modèles synchronisés avec la base de données');

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
  logger.error('Unhandled Rejection', { reason: String(reason) });
  process.exit(1);
});

startServer();

module.exports = app;
