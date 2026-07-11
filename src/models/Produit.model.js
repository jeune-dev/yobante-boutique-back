const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Produit = sequelize.define(
  'Produit',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prix: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    prixPromo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stockAlloue: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Stock réservé / alloué aux commandes en cours',
    },
    infoLegale: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    noteMoyenne: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    nombreAvis: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    statutValidation: {
      type: DataTypes.ENUM('en_attente', 'valide_step1', 'valide', 'rejete'),
      defaultValue: 'valide',
    },
    vendeurId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    poids: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
    },
    categorieId: {
      type: DataTypes.UUID,
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
  },
  {
    timestamps: true,
    tableName: 'produits',
    indexes: [
      { fields: ['categorieId'] },
      { fields: ['vendeurId'] },
      { fields: ['statutValidation'] },
      { fields: ['isActive'] },
      { fields: ['isFeatured'] },
      { fields: ['slug'], unique: true },
      {
        fields: ['reference'],
        unique: true,
        where: { reference: { [require('sequelize').Op.ne]: null } },
      },
    ],
  }
);

module.exports = Produit;
