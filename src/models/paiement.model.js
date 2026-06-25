const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Paiement = sequelize.define('Paiement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  commandeId: { type: DataTypes.UUID, allowNull: false, unique: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  montant: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  methode: {
    type: DataTypes.ENUM('wave', 'orange_money', 'carte', 'cash_livraison'),
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'succes', 'echoue', 'rembourse'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  transactionId: { type: DataTypes.STRING, allowNull: true },
  payeAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
});

module.exports = Paiement;
