'use strict';

/**
 * Colonnes nécessaires à l'exécution d'un paiement.
 *
 * Le modèle savait enregistrer qu'un paiement existait, mais pas comment le
 * poursuivre : ni chez quel fournisseur, ni où le finaliser, ni pourquoi il
 * avait échoué.
 */
// Rejouable : `sequelize.sync()` peut avoir déjà créé ces colonnes.
async function ajouterColonneSiAbsente(queryInterface, table, colonne, definition) {
  const description = await queryInterface.describeTable(table);
  if (!description[colonne]) await queryInterface.addColumn(table, colonne, definition);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ajouterColonneSiAbsente(queryInterface, 'paiements', 'fournisseur', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await ajouterColonneSiAbsente(queryInterface, 'paiements', 'urlPaiement', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await ajouterColonneSiAbsente(queryInterface, 'paiements', 'derniereErreur', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    // Le callback retrouve le paiement par sa référence fournisseur.
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "paiements_transaction_id_idx" ON "paiements" ("transactionId")'
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('paiements', 'paiements_transaction_id_idx');
    await queryInterface.removeColumn('paiements', 'fournisseur');
    await queryInterface.removeColumn('paiements', 'urlPaiement');
    await queryInterface.removeColumn('paiements', 'derniereErreur');
  },
};
