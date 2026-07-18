'use strict';

/**
 * Demande de publication d'un produit par un vendeur.
 *
 * - messageVendeur : mot libre du vendeur à l'attention du relecteur
 * - motifRejet     : raison du refus, jusqu'ici seulement renvoyée dans la
 *                    réponse HTTP et donc perdue — le vendeur ne pouvait pas
 *                    savoir ce qu'on lui reprochait.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('produits', 'messageVendeur', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('produits', 'motifRejet', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('produits', 'messageVendeur');
    await queryInterface.removeColumn('produits', 'motifRejet');
  },
};
