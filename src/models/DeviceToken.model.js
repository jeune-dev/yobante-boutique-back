const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Jeton d'appareil pour l'envoi push.
 *
 * Un même utilisateur peut avoir plusieurs appareils ; un même appareil peut
 * changer de main, d'où l'unicité portée par le jeton et non par l'utilisateur.
 */
const DeviceToken = sequelize.define(
  'DeviceToken',
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
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    plateforme: {
      type: DataTypes.ENUM('android', 'ios', 'web'),
      allowNull: false,
      defaultValue: 'android',
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
    tableName: 'device_tokens',
    indexes: [{ fields: ['userId'] }, { unique: true, fields: ['token'] }],
  }
);

module.exports = DeviceToken;
