'use strict';

/**
 * Notifications utilisateur et jetons d'appareil.
 *
 * Les notifications sont conservées en base : le bandeau système est un
 * doublon éphémère, l'application doit pouvoir en afficher l'historique et
 * compter les non-lues sans dépendre de la couche push.
 */
// Rejouable : `sequelize.sync()` peut avoir déjà créé ces tables.
async function creerSiAbsente(queryInterface, nom, definition) {
  const tables = await queryInterface.showAllTables();
  const existe = tables.some((t) => (typeof t === 'string' ? t : t.tableName) === nom);
  if (!existe) await queryInterface.createTable(nom, definition);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await creerSiAbsente(queryInterface, 'notifications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      titre: { type: Sequelize.STRING(150), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.STRING(50), allowNull: false },
      donnees: { type: Sequelize.JSONB, allowNull: true, defaultValue: {} },
      lu: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      luAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    // Le compteur de non-lues est la requête la plus fréquente de la cloche.
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "notifications_user_lu_idx" ON "notifications" ("userId", "lu")'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" ("createdAt")'
    );

    await creerSiAbsente(queryInterface, 'device_tokens', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      token: { type: Sequelize.TEXT, allowNull: false, unique: true },
      plateforme: {
        type: Sequelize.ENUM('android', 'ios', 'web'),
        allowNull: false,
        defaultValue: 'android',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "device_tokens_user_idx" ON "device_tokens" ("userId")'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_tokens');
    await queryInterface.dropTable('notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_device_tokens_plateforme"');
  },
};
