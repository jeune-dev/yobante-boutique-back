'use strict';

/**
 * Sous-sections de l'accueil client.
 *
 * `blocs_promo.section` portait une contrainte d'unicité qui limitait chaque
 * section à un seul bloc. La lever permet à l'administration d'ajouter
 * plusieurs sous-sections par section, ordonnées par `ordre`.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Le nom de la contrainte dépend de la façon dont la table a été créée
    // (sync ou migration) : on tente les deux formes usuelles sans échouer.
    for (const nom of ['blocs_promo_section_key', 'blocs_promo_section_unique']) {
      await queryInterface.sequelize
        .query(`ALTER TABLE "blocs_promo" DROP CONSTRAINT IF EXISTS "${nom}"`)
        .catch(() => {});
    }
    // Sequelize crée parfois l'unicité sous forme d'index plutôt que de contrainte.
    await queryInterface.sequelize
      .query('DROP INDEX IF EXISTS "blocs_promo_section_key"')
      .catch(() => {});

    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "blocs_promo_section_ordre_idx" ON "blocs_promo" ("section", "ordre")'
    );

    // `titre` sert désormais de nom de sous-section : on le rend obligatoire
    // côté applicatif seulement, pour ne pas casser les lignes existantes.
    await queryInterface.changeColumn('blocs_promo', 'section', {
      type: Sequelize.ENUM('nos_promos_du_moment', 'a_ne_pas_rater', 'nos_promos_a_venir'),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('blocs_promo', 'blocs_promo_section_ordre_idx');
    // Le retour en arrière n'est possible que s'il ne reste qu'un bloc par
    // section ; sinon la contrainte d'unicité serait rejetée.
    await queryInterface.addConstraint('blocs_promo', {
      fields: ['section'],
      type: 'unique',
      name: 'blocs_promo_section_key',
    });
  },
};
