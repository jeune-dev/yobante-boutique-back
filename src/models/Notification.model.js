const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    titre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'commande, paiement, produit… sert au routage à l’ouverture',
    },
    donnees: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Contexte pour ouvrir le bon écran (commandeId, produitId…)',
    },
    lu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    luAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: 'notifications',
    indexes: [
      // Le compteur de non-lues est la requête la plus fréquente.
      { fields: ['userId', 'lu'] },
      { fields: ['createdAt'] },
    ],
  }
);

module.exports = Notification;
