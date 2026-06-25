const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserOtp = sequelize.define('UserOtp', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('email_verification', 'reset_password'), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  isUsed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = UserOtp;
