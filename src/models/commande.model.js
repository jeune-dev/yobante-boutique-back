const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Commande = sequelize.define(
  'Commande',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reference: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    adresseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM(
        'en_attente',
        'validee',
        'en_preparation',
        'expediee',
        'livree',
        'annulee',
        'rejetee'
      ),
      defaultValue: 'en_attente',
      allowNull: false,
    },
    montantTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fraisLivraison: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    // Date souhaitée par le client, saisie au moment de commander. Indicative :
    // elle guide la préparation sans engager de créneau ferme.
    dateLivraisonSouhaitee: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    noteAdmin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    motifRejet: {
      type: DataTypes.TEXT,
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
    tableName: 'commandes',
    indexes: [
      { fields: ['userId'] },
      { fields: ['adresseId'] },
      { fields: ['statut'] },
      { unique: true, fields: ['reference'] },
    ],
  }
);

module.exports = Commande;
