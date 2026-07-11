const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Favori : un client (User) met en favori une boutique (ProfilVendeur).
const Favori = sequelize.define(
  'Favori',
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
    profilVendeurId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'favoris',
    indexes: [{ unique: true, fields: ['userId', 'profilVendeurId'] }, { fields: ['userId'] }],
  }
);

module.exports = Favori;
