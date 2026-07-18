'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    // Extensions PostgreSQL
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Index FK sur commande_items
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_commande_items_commande ON commande_items ("commandeId");
      CREATE INDEX IF NOT EXISTS idx_commande_items_produit ON commande_items ("produitId");
    `);

    // Index composite refresh_tokens
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_expires
        ON refresh_tokens ("userId", "expiresAt");
    `);

    // Index user_otps
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_otps_user_type
        ON user_otps ("userId", "type", "isUsed");
      CREATE INDEX IF NOT EXISTS idx_user_otps_expires
        ON user_otps ("expiresAt");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_commande_items_commande;
      DROP INDEX IF EXISTS idx_commande_items_produit;
      DROP INDEX IF EXISTS idx_refresh_tokens_user_expires;
      DROP INDEX IF EXISTS idx_user_otps_user_type;
      DROP INDEX IF EXISTS idx_user_otps_expires;
    `);
  },
};
