const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Paiement = sequelize.define(
  'Paiement',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    commandeId: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    montant: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    methode: {
      type: DataTypes.ENUM('wave', 'orange_money', 'carte', 'cash_livraison'),
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM('en_attente', 'succes', 'echoue', 'rembourse'),
      defaultValue: 'en_attente',
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Référence de la transaction chez le fournisseur',
    },
    fournisseur: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Fournisseur ayant traité le paiement (simulation, wave…)',
    },
    urlPaiement: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL à ouvrir pour finaliser le paiement, le cas échéant',
    },
    derniereErreur: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motif du dernier échec, affiché au client pour réessayer',
    },
    payeAt: {
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
    tableName: 'paiements',
    indexes: [
      { unique: true, fields: ['commandeId'] },
      { fields: ['userId'] },
      { fields: ['statut'] },
    ],
  }
);

module.exports = Paiement;
