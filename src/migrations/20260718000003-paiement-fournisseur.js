'use strict';

/**
 * Colonnes nécessaires à l'exécution d'un paiement.
 *
 * Le modèle savait enregistrer qu'un paiement existait, mais pas comment le
 * poursuivre : ni chez quel fournisseur, ni où le finaliser, ni pourquoi il
 * avait échoué.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('paiements', 'fournisseur', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('paiements', 'urlPaiement', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('paiements', 'derniereErreur', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    // Le callback retrouve le paiement par sa référence fournisseur.
    await queryInterface.addIndex('paiements', ['transactionId'], {
      name: 'paiements_transaction_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('paiements', 'paiements_transaction_id_idx');
    await queryInterface.removeColumn('paiements', 'fournisseur');
    await queryInterface.removeColumn('paiements', 'urlPaiement');
    await queryInterface.removeColumn('paiements', 'derniereErreur');
  },
};
