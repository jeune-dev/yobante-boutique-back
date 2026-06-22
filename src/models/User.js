const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom:      { type: DataTypes.STRING, allowNull: false },
  prenom:   { type: DataTypes.STRING, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  motDePasse:   { type: DataTypes.STRING, allowNull: false },
  role:         { type: DataTypes.ENUM('admin', 'vendeur', 'client'), defaultValue: 'client', allowNull: false },
  estActif:     { type: DataTypes.BOOLEAN, defaultValue: true },
  avatar:           { type: DataTypes.STRING, allowNull: true },
  avatarIdPublic:   { type: DataTypes.STRING, allowNull: true },
  tokenRafraichissement:    { type: DataTypes.TEXT,   allowNull: true },
  tokenReinitialisation:    { type: DataTypes.STRING, allowNull: true },
  expirationReinitialisation: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'creeLe',
  updatedAt: 'miseAJourLe',
});

module.exports = User;
