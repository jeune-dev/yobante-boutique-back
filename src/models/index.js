// ─────────────────────────────────────────────────────────────
// models/index.js — Initialisation Sequelize et associations
// ─────────────────────────────────────────────────────────────

// TODO: importer sequelize depuis ../config/db
// TODO: importer tous les modèles

// TODO: définir toutes les associations entre modèles :
//   User.hasMany(Commande)          Commande.belongsTo(User)
//   User.hasMany(Adresse)           Adresse.belongsTo(User)
//   User.hasMany(Panier)            Panier.belongsTo(User)
//   User.hasMany(Avis)              Avis.belongsTo(User)
//   User.hasMany(RefreshToken)      RefreshToken.belongsTo(User)
//   User.hasMany(UserOtp)           UserOtp.belongsTo(User)
//   Categorie.hasMany(Produit)      Produit.belongsTo(Categorie)
//   Categorie.hasMany(Categorie, { as: 'sousCategories', foreignKey: 'parentId' })
//   Produit.hasMany(CommandeItem)   CommandeItem.belongsTo(Produit)
//   Produit.hasMany(Panier)         Panier.belongsTo(Produit)
//   Produit.hasMany(Avis)           Avis.belongsTo(Produit)
//   Commande.hasMany(CommandeItem)  CommandeItem.belongsTo(Commande)
//   Commande.hasOne(Paiement)       Paiement.belongsTo(Commande)
//   Commande.belongsTo(Adresse)

// TODO: exporter { sequelize, User, Categorie, Produit, Adresse,
//         Commande, CommandeItem, Paiement, Avis, Panier,
//         RefreshToken, UserOtp }
