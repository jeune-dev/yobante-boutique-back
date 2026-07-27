'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Marquer l'ancienne migration comme exécutée si elle ne l'est pas
    await queryInterface.sequelize.query(`
      INSERT INTO "SequelizeMeta" (name)
      SELECT 'add_motif_rejet_to_commandes.js'
      WHERE NOT EXISTS (
        SELECT 1 FROM "SequelizeMeta"
        WHERE name = 'add_motif_rejet_to_commandes.js'
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    // Undo: supprimer l'entrée
    await queryInterface.sequelize.query(`
      DELETE FROM "SequelizeMeta"
      WHERE name = 'add_motif_rejet_to_commandes.js';
    `);
  },
};
