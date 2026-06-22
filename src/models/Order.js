const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  clientId: { type: DataTypes.UUID, allowNull: false },
  statut: {
    type: DataTypes.ENUM('en_attente', 'confirmee', 'expediee', 'livree', 'annulee'),
    defaultValue: 'en_attente',
    allowNull: false,
  },
  total:            { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  adresseLivraison: { type: DataTypes.JSONB, allowNull: false },
  notes:            { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'creeLe',
  updatedAt: 'miseAJourLe',
});

module.exports = Order;
