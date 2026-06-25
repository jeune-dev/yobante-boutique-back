const sequelize = require('../config/db');
const User = require('./User.model');
const Adresse = require('./adresse.model');
const Categorie = require('./Categorie.model');
const Produit = require('./Produit.model');
const Commande = require('./commande.model');
const CommandeItem = require('./commandeItem.model');
const Paiement = require('./paiement.model');
const Panier = require('./panier.model');
const Avis = require('./avis.model');
const RefreshToken = require('./refreshToken.model');
const UserOtp = require('./userOtp.model');

User.hasMany(Commande, { foreignKey: 'userId' });
Commande.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Adresse, { foreignKey: 'userId' });
Adresse.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Panier, { foreignKey: 'userId' });
Panier.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Avis, { foreignKey: 'userId' });
Avis.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserOtp, { foreignKey: 'userId' });
UserOtp.belongsTo(User, { foreignKey: 'userId' });
Categorie.hasMany(Produit, { foreignKey: 'categorieId' });
Produit.belongsTo(Categorie, { foreignKey: 'categorieId' });
Categorie.hasMany(Categorie, { as: 'sousCategories', foreignKey: 'parentId' });
Produit.hasMany(CommandeItem, { foreignKey: 'produitId' });
CommandeItem.belongsTo(Produit, { foreignKey: 'produitId' });
Produit.hasMany(Panier, { foreignKey: 'produitId' });
Panier.belongsTo(Produit, { foreignKey: 'produitId' });
Produit.hasMany(Avis, { foreignKey: 'produitId' });
Avis.belongsTo(Produit, { foreignKey: 'produitId' });
Commande.hasMany(CommandeItem, { foreignKey: 'commandeId' });
CommandeItem.belongsTo(Commande, { foreignKey: 'commandeId' });
Commande.hasOne(Paiement, { foreignKey: 'commandeId' });
Paiement.belongsTo(Commande, { foreignKey: 'commandeId' });
Commande.belongsTo(Adresse, { foreignKey: 'adresseId' });

module.exports = {
  sequelize,
  User,
  Adresse,
  Categorie,
  Produit,
  Commande,
  CommandeItem,
  Paiement,
  Avis,
  Panier,
  RefreshToken,
  UserOtp,
};
