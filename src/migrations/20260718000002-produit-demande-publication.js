'use strict';

/**
 * Demande de publication d'un produit par un vendeur.
 *
 * - messageVendeur : mot libre du vendeur à l'attention du relecteur
 * - motifRejet     : raison du refus, jusqu'ici seulement renvoyée dans la
 *                    réponse HTTP et donc perdue — le vendeur ne pouvait pas
 *                    savoir ce qu'on lui reprochait.
 */
// Rejouable : `sequelize.sync()` peut avoir déjà créé ces colonnes sur les
// environnements où il tourne.
async function ajouterColonneSiAbsente(queryInterface, table, colonne, definition) {
  const description = await queryInterface.describeTable(table);
  if (!description[colonne]) await queryInterface.addColumn(table, colonne, definition);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ajouterColonneSiAbsente(queryInterface, 'produits', 'messageVendeur', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await ajouterColonneSiAbsente(queryInterface, 'produits', 'motifRejet', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('produits', 'messageVendeur');
    await queryInterface.removeColumn('produits', 'motifRejet');
  },
};
