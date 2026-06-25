const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Adresse = sequelize.define('Adresse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  nomComplet: { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING, allowNull: false },
  rue: { type: DataTypes.STRING, allowNull: false },
  ville: { type: DataTypes.STRING, allowNull: false },
  region: { type: DataTypes.STRING, allowNull: true },
  pays: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Sénégal' },
  codePostal: { type: DataTypes.STRING, allowNull: true },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  timestamps: true,
});

module.exports = Adresse;
