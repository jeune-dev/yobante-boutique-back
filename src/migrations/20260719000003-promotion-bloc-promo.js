'use strict';

/**
 * Rattache une promotion à une sous-section d'accueil.
 *
 * Jusqu'ici une promotion ne connaissait que sa section, ce qui empêchait
 * l'administration de composer le contenu d'une sous-section en particulier.
 *
 * Colonne facultative : les promotions existantes restent valables au niveau
 * de leur section, sans rattachement.
 */

// Rejouable : `sequelize.sync()` peut avoir déjà créé la colonne.
async function ajouterColonneSiAbsente(queryInterface, table, colonne, definition) {
  const description = await queryInterface.describeTable(table);
  if (!description[colonne]) await queryInterface.addColumn(table, colonne, definition);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ajouterColonneSiAbsente(queryInterface, 'promotions', 'blocPromoId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'blocs_promo', key: 'id' },
      onDelete: 'SET NULL',
    });

    // L'écran d'administration liste les produits d'une sous-section, dans
    // l'ordre choisi : c'est la requête la plus fréquente de cette table.
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "promotions_bloc_ordre_idx" ON "promotions" ("blocPromoId", "ordre")'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "promotions_bloc_ordre_idx"');
    await queryInterface.removeColumn('promotions', 'blocPromoId');
  },
};
