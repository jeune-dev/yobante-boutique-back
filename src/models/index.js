// ─────────────────────────────────────────────────────────────
// models/index.js — Initialisation Sequelize et associations
// ─────────────────────────────────────────────────────────────

const sequelize = require('../config/db');
const User = require('./User.model');
const Categorie = require('./Categorie.model');
const Produit = require('./Produit.model');
const Commande = require('./commande.model');
const CommandeItem = require('./commandeItem.model');
const Paiement = require('./paiement.model');
const Adresse = require('./adresse.model');
const Panier = require('./panier.model');
const Avis = require('./avis.model');
const RefreshToken = require('./refreshToken.model');
const UserOtp = require('./userOtp.model');
const ProfilVendeur = require('./ProfilVendeur.model');
const Banniere = require('./Banniere.model');
const Promotion = require('./Promotion.model');
const FraisLivraison = require('./FraisLivraison.model');
const Favori = require('./Favori.model');
const BlocPromo = require('./BlocPromo.model');

// ── User associations ──────────────────────────────────────────
User.hasMany(Commande, { foreignKey: 'userId', as: 'commandes', onDelete: 'CASCADE' });
User.hasMany(Adresse, { foreignKey: 'userId', as: 'adresses', onDelete: 'CASCADE' });
User.hasMany(Panier, { foreignKey: 'userId', as: 'panier', onDelete: 'CASCADE' });
User.hasMany(Avis, { foreignKey: 'userId', as: 'avis', onDelete: 'CASCADE' });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
User.hasMany(UserOtp, { foreignKey: 'userId', as: 'otps', onDelete: 'CASCADE' });
User.hasMany(Paiement, { foreignKey: 'userId', as: 'paiements', onDelete: 'CASCADE' });
User.hasOne(ProfilVendeur, { foreignKey: 'userId', as: 'profilVendeur', onDelete: 'CASCADE' });
User.hasMany(Produit, { foreignKey: 'vendeurId', as: 'produits', onDelete: 'SET NULL' });

// ── Categorie associations ─────────────────────────────────────
Categorie.hasMany(Produit, { foreignKey: 'categorieId', as: 'produits', onDelete: 'CASCADE' });
Categorie.hasMany(Categorie, { as: 'sousCategories', foreignKey: 'parentId', onDelete: 'CASCADE' });
Categorie.belongsTo(Categorie, { as: 'parentCategorie', foreignKey: 'parentId' });
Categorie.hasMany(Banniere, { foreignKey: 'categorieId', as: 'bannieres' });

// ── Produit associations ───────────────────────────────────────
Produit.belongsTo(Categorie, { foreignKey: 'categorieId', as: 'categorie' });
Produit.belongsTo(User, { foreignKey: 'vendeurId', as: 'vendeur' });
Produit.hasMany(CommandeItem, {
  foreignKey: 'produitId',
  as: 'commandeItems',
  onDelete: 'CASCADE',
});
Produit.hasMany(Panier, { foreignKey: 'produitId', as: 'paniers', onDelete: 'CASCADE' });
Produit.hasMany(Avis, { foreignKey: 'produitId', as: 'avis', onDelete: 'CASCADE' });
Produit.hasMany(Promotion, { foreignKey: 'produitId', as: 'promotions', onDelete: 'CASCADE' });

// ── Commande associations ──────────────────────────────────────
Commande.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Commande.belongsTo(Adresse, { foreignKey: 'adresseId', as: 'adresse' });
Commande.hasMany(CommandeItem, { foreignKey: 'commandeId', as: 'items', onDelete: 'CASCADE' });
Commande.hasOne(Paiement, { foreignKey: 'commandeId', as: 'paiement', onDelete: 'CASCADE' });

// ── CommandeItem associations ──────────────────────────────────
CommandeItem.belongsTo(Commande, { foreignKey: 'commandeId', as: 'commande' });
CommandeItem.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

// ── Paiement associations ──────────────────────────────────────
Paiement.belongsTo(Commande, { foreignKey: 'commandeId', as: 'commande' });
Paiement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Adresse associations ───────────────────────────────────────
Adresse.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Adresse.hasMany(Commande, { foreignKey: 'adresseId', as: 'commandes', onDelete: 'SET NULL' });

// ── Panier associations ────────────────────────────────────────
Panier.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Panier.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

// ── Avis associations ──────────────────────────────────────────
Avis.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Avis.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

// ── RefreshToken associations ──────────────────────────────────
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── UserOtp associations ───────────────────────────────────────
UserOtp.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── ProfilVendeur associations ─────────────────────────────────
ProfilVendeur.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Favori associations ────────────────────────────────────────
User.hasMany(Favori, { foreignKey: 'userId', as: 'favoris', onDelete: 'CASCADE' });
Favori.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProfilVendeur.hasMany(Favori, {
  foreignKey: 'profilVendeurId',
  as: 'favoris',
  onDelete: 'CASCADE',
});
Favori.belongsTo(ProfilVendeur, { foreignKey: 'profilVendeurId', as: 'boutique' });

// ── Banniere associations ──────────────────────────────────────
Banniere.belongsTo(Categorie, { foreignKey: 'categorieId', as: 'categorie' });

// ── Promotion associations ─────────────────────────────────────
Promotion.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

// ── Export all models ──────────────────────────────────────────
module.exports = {
  sequelize,
  User,
  Categorie,
  Produit,
  Commande,
  CommandeItem,
  Paiement,
  Adresse,
  Panier,
  Avis,
  RefreshToken,
  UserOtp,
  ProfilVendeur,
  Banniere,
  Promotion,
  FraisLivraison,
  Favori,
  BlocPromo,
};
