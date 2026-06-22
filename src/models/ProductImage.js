const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductImage = sequelize.define('ProductImage', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  produitId:  { type: DataTypes.UUID, allowNull: false },
  url:        { type: DataTypes.STRING, allowNull: false },
  idPublic:   { type: DataTypes.STRING, allowNull: true },
  estPrimaire: { type: DataTypes.BOOLEAN, defaultValue: false },
  ordre:      { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'product_images',
  timestamps: false,
});

module.exports = ProductImage;
