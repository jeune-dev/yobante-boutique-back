'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Ajouter la colonne motifRejet
      await queryInterface.addColumn('commandes', 'motifRejet', {
        type: Sequelize.TEXT,
        allowNull: true,
        transaction,
      });

      // Modifier l'enum du statut pour ajouter 'rejetee'
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_commandes_statut" ADD VALUE 'rejetee'`,
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Supprimer la colonne motifRejet
      await queryInterface.removeColumn('commandes', 'motifRejet', {
        transaction,
      });

      // Note: On ne peut pas supprimer une valeur d'enum en PostgreSQL
      // donc on laisse 'rejetee' dans l'enum (inoffensif)
    });
  },
};
