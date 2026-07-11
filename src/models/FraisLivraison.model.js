const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Tarifs de livraison configurés par l'admin (vers Dakar et autres villes du Sénégal)
const FraisLivraison = sequelize.define(
  'FraisLivraison',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pays: {
      type: DataTypes.STRING(100),
      defaultValue: 'Sénégal',
      allowNull: false,
    },
    montant: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Montant en EUR ou XOF selon le contexte',
    },
    devise: {
      type: DataTypes.STRING(10),
      defaultValue: 'FCFA',
    },
    delaiEstime: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ex: 7-10 jours ouvrés',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'frais_livraisons',
  }
);

module.exports = FraisLivraison;
