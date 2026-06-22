const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  commandeId:   { type: DataTypes.UUID, allowNull: false },
  produitId:    { type: DataTypes.UUID, allowNull: false },
  quantite:     { type: DataTypes.INTEGER, allowNull: false },
  prixUnitaire: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'order_items',
  timestamps: false,
});

module.exports = OrderItem;
