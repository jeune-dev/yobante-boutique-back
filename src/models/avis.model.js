const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Avis = sequelize.define('Avis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  produitId: { type: DataTypes.INTEGER, allowNull: false },
  note: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  commentaire: { type: DataTypes.TEXT, allowNull: true },
  isApproved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  timestamps: true,
});

module.exports = Avis;
