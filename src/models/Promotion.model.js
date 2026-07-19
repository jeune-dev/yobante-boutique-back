const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Représente une mise en avant promotionnelle d'un produit dans une section dédiée
const Promotion = sequelize.define(
  'Promotion',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    produitId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    blocPromoId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment:
        "Sous-section d'accueil à laquelle la promotion est rattachée. " +
        'Nulle : la promotion reste au niveau de la section.',
    },
    section: {
      type: DataTypes.ENUM('nos_promos_du_moment', 'a_ne_pas_rater', 'nos_promos_a_venir'),
      allowNull: false,
    },
    titre: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prixPromo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment:
        'Prix promotionnel spécifique à cette mise en avant (override le prix promo du produit)',
    },
    pourcentageReduction: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    dateDebut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dateFin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ordre: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: 'promotions',
  }
);

module.exports = Promotion;
