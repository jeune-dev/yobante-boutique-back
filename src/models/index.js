const sequelize = require('../config/db');

const User         = require('./User');
const Category     = require('./Category');
const Product      = require('./Product');
const ProductImage = require('./ProductImage');
const Order        = require('./Order');
const OrderItem    = require('./OrderItem');

// Sous-catégories
Category.hasMany(Category,   { foreignKey: 'parentId', as: 'sousCategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

// Catégorie → Produits
Category.hasMany(Product,  { foreignKey: 'categorieId', as: 'produits' });
Product.belongsTo(Category, { foreignKey: 'categorieId', as: 'categorie' });

// Vendeur → Produits
User.hasMany(Product,  { foreignKey: 'vendeurId', as: 'produits' });
Product.belongsTo(User, { foreignKey: 'vendeurId', as: 'vendeur' });

// Produit → Images
Product.hasMany(ProductImage,   { foreignKey: 'produitId', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'produitId' });

// Client → Commandes
User.hasMany(Order,  { foreignKey: 'clientId', as: 'commandes' });
Order.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// Commande → Articles
Order.hasMany(OrderItem,   { foreignKey: 'commandeId', as: 'articles', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'commandeId' });

// Produit → Articles de commande
Product.hasMany(OrderItem,   { foreignKey: 'produitId', as: 'lignesCommande' });
OrderItem.belongsTo(Product, { foreignKey: 'produitId', as: 'produit' });

module.exports = { sequelize, User, Category, Product, ProductImage, Order, OrderItem };
