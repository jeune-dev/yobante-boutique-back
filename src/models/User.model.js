const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  prenom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM('client', 'admin'), allowNull: false, defaultValue: 'client' },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  avatar: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
});

module.exports = User;
