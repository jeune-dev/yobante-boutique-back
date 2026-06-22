const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom:         { type: DataTypes.STRING, allowNull: false },
  slug:        { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT,   allowNull: true },
  prix:        { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  estActif:    { type: DataTypes.BOOLEAN, defaultValue: true },
  categorieId: { type: DataTypes.UUID, allowNull: true },
  vendeurId:   { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'creeLe',
  updatedAt: 'miseAJourLe',
});

module.exports = Product;
