const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CommandeItem = sequelize.define('CommandeItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  commandeId: { type: DataTypes.UUID, allowNull: false },
  produitId: { type: DataTypes.INTEGER, allowNull: false },
  quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  prixUnitaire: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  sousTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = CommandeItem;
