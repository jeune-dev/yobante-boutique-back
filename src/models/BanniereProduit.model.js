const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BanniereProduit = sequelize.define(
  'BanniereProduit',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    banniereId: { type: DataTypes.UUID, allowNull: false },
    produitId: { type: DataTypes.UUID, allowNull: false },
    ordre: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'banniere_produits', timestamps: true }
);

module.exports = BanniereProduit;
