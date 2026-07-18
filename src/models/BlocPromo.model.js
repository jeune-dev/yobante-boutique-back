const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Métadonnées d'affichage d'un bloc promo (une ligne par section).
// L'image et le titre du bloc sont pilotés depuis le dashboard admin et
// consommés par l'app mobile (remplace les images figées en dur).
const BlocPromo = sequelize.define(
  'BlocPromo',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    section: {
      type: DataTypes.ENUM('nos_promos_du_moment', 'a_ne_pas_rater', 'nos_promos_a_venir'),
      allowNull: false,
      unique: true,
      comment: 'Identifie le bloc promo (une seule ligne par section)',
    },
    titre: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    sousTitre: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Bannière du bloc affichée dans l’app mobile',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ordre: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: 'blocs_promo',
  }
);

module.exports = BlocPromo;
