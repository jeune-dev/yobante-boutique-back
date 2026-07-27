'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Vérifier si la colonne motifRejet existe
    const columns = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='commandes' AND column_name='motifRejet'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Ajouter la colonne si elle n'existe pas
    if (columns.length === 0) {
      await queryInterface.addColumn('commandes', 'motifRejet', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    // Ajouter la valeur enum 'rejetee' (ignorer si existe déjà)
    try {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_commandes_statut" ADD VALUE 'rejetee'`
      );
    } catch (error) {
      // Ignorer l'erreur si la valeur existe déjà
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Supprimer la colonne motifRejet si elle existe
    const columns = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='commandes' AND column_name='motifRejet'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (columns.length > 0) {
      await queryInterface.removeColumn('commandes', 'motifRejet');
    }

    // Note: On ne peut pas supprimer une valeur d'enum en PostgreSQL
    // donc on laisse 'rejetee' dans l'enum (inoffensif)
  },
};
