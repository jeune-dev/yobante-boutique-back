const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Bloc promotionnel d'une section de l'accueil client.
//
// Une section porte autant de blocs que voulu — ce sont les « sous-sections »
// visibles dans l'application, ordonnées par `ordre`. Image, titre et
// sous-titre sont pilotés depuis le dashboard admin.
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
      comment: 'Section de rattachement — plusieurs blocs possibles par section',
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
    // L'accueil lit les blocs section par section, dans l'ordre d'affichage.
    indexes: [{ fields: ['section', 'ordre'] }],
  }
);

module.exports = BlocPromo;
