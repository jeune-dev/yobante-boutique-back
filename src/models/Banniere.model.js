const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banniere = sequelize.define(
  'Banniere',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    titre: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    lien: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de redirection au clic (peut pointer vers une catégorie)',
    },
    categorieId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Catégorie associée à la bannière',
    },
    ordre: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Ordre d'affichage dans le carousel",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: 'bannieres',
  }
);

module.exports = Banniere;
