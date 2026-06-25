const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Commande = sequelize.define('Commande', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reference: { type: DataTypes.STRING, allowNull: false, unique: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  adresseId: { type: DataTypes.INTEGER, allowNull: false },
  statut: {
    type: DataTypes.ENUM('en_attente', 'validee', 'en_preparation', 'expediee', 'livree', 'annulee'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  montantTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0 },
  fraisLivraison: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0 },
  note: { type: DataTypes.TEXT, allowNull: true },
  noteAdmin: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});

module.exports = Commande;
