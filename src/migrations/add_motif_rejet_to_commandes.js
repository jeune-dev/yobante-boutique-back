'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Ajouter la colonne motifRejet (ignorer si existe déjà)
      try {
        await queryInterface.addColumn('commandes', 'motifRejet', {
          type: Sequelize.TEXT,
          allowNull: true,
          transaction,
        });
      } catch (error) {
        // Ignorer l'erreur si la colonne existe déjà
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }

      // Modifier l'enum du statut pour ajouter 'rejetee' (ignorer si existe déjà)
      try {
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_commandes_statut" ADD VALUE 'rejetee'`,
          { transaction }
        );
      } catch (error) {
        // Ignorer l'erreur si la valeur existe déjà
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Supprimer la colonne motifRejet
      const tableInfo = await queryInterface.describeTable('commandes');
      if (tableInfo.motifRejet) {
        await queryInterface.removeColumn('commandes', 'motifRejet', {
          transaction,
        });
      }

      // Note: On ne peut pas supprimer une valeur d'enum en PostgreSQL
      // donc on laisse 'rejetee' dans l'enum (inoffensif)
    });
  },
};
