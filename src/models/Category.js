const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom:          { type: DataTypes.STRING, allowNull: false },
  slug:         { type: DataTypes.STRING, allowNull: false, unique: true },
  description:  { type: DataTypes.TEXT,   allowNull: true },
  image:        { type: DataTypes.STRING, allowNull: true },
  imageIdPublic: { type: DataTypes.STRING, allowNull: true },
  parentId:     { type: DataTypes.UUID,   allowNull: true },
  estActif:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'creeLe',
  updatedAt: 'miseAJourLe',
});

module.exports = Category;
