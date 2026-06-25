const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Panier = sequelize.define('Panier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  produitId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  quantite: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'paniers',
});

module.exports = Panier;
