const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Paiement = sequelize.define('Paiement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  commandeId: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  methode: {
    type: DataTypes.ENUM('wave', 'orange_money', 'carte', 'cash_livraison'),
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'succes', 'echoue', 'rembourse'),
    defaultValue: 'en_attente',
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  payeAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'paiements',
});

module.exports = Paiement;
