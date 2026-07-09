const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CommandeItem = sequelize.define(
  'CommandeItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    commandeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    produitId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    prixUnitaire: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sousTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: 'commande_items',
    indexes: [{ fields: ['commandeId'] }, { fields: ['produitId'] }],
  }
);

module.exports = CommandeItem;
