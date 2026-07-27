'use strict';

/**
 * Date de livraison souhaitée par le client.
 *
 * Le client pouvait choisir *où* être livré, jamais *quand* : la préparation
 * partait donc sans indication de délai. Colonne facultative — les commandes
 * déjà passées restent valides sans elle.
 */
// Rejouable : `sequelize.sync()` peut avoir déjà créé la colonne.
async function ajouterColonneSiAbsente(queryInterface, table, colonne, definition) {
  const description = await queryInterface.describeTable(table);
  if (!description[colonne]) await queryInterface.addColumn(table, colonne, definition);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ajouterColonneSiAbsente(queryInterface, 'commandes', 'dateLivraisonSouhaitee', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('commandes', 'dateLivraisonSouhaitee');
  },
};
