'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Utiliser une requête PL/pgSQL qui ignore les erreurs
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Ajouter la colonne si elle n'existe pas
        IF NOT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'commandes'
          AND column_name = 'motifRejet'
        ) THEN
          ALTER TABLE commandes ADD COLUMN "motifRejet" TEXT;
        END IF;
      END $$;
    `);

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
    // Migration down optionnel
    // On ne supprime pas pour éviter les pertes de données
  },
};
