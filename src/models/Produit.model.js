const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Produit = sequelize.define('Produit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0 },
  prixPromo: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  categorieId: { type: DataTypes.INTEGER, allowNull: false },
  images: { type: DataTypes.JSON, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  poids: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  reference: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
});

module.exports = Produit;
