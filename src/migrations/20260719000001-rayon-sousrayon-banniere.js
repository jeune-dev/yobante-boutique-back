'use strict';

/**
 * Rayons, sous-rayons et liaison bannière ↔ produit.
 *
 * Rendue rejouable : sur les environnements où `sequelize.sync()` tourne
 * (NODE_ENV différent de production), les tables et colonnes peuvent déjà
 * exister. Sans ces gardes, la migration échouerait et bloquerait le
 * démarrage de l'application.
 */

/** Crée la table seulement si elle n'existe pas déjà. */
async function creerSiAbsente(queryInterface, nom, definition) {
  const tables = await queryInterface.showAllTables();
  const existe = tables.some((t) => (typeof t === 'string' ? t : t.tableName) === nom);
  if (!existe) await queryInterface.createTable(nom, definition);
}

/** Ajoute la colonne seulement si elle n'existe pas déjà. */
async function ajouterColonneSiAbsente(queryInterface, table, colonne, definition) {
  const description = await queryInterface.describeTable(table);
  if (!description[colonne]) await queryInterface.addColumn(table, colonne, definition);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await creerSiAbsente(queryInterface, 'rayons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: Sequelize.TEXT,
      image: Sequelize.STRING(500),
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await creerSiAbsente(queryInterface, 'sous_rayons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: Sequelize.TEXT,
      image: Sequelize.STRING(500),
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      rayonId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'rayons', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await creerSiAbsente(queryInterface, 'banniere_produits', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      banniereId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'bannieres', key: 'id' },
        onDelete: 'CASCADE',
      },
      produitId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'produits', key: 'id' },
        onDelete: 'CASCADE',
      },
      ordre: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await ajouterColonneSiAbsente(queryInterface, 'produits', 'rayonId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'rayons', key: 'id' },
    });
    await ajouterColonneSiAbsente(queryInterface, 'produits', 'sousRayonId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'sous_rayons', key: 'id' },
    });
    await ajouterColonneSiAbsente(queryInterface, 'users', 'mustChangePassword', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'mustChangePassword');
    await queryInterface.removeColumn('produits', 'sousRayonId');
    await queryInterface.removeColumn('produits', 'rayonId');
    await queryInterface.dropTable('banniere_produits');
    await queryInterface.dropTable('sous_rayons');
    await queryInterface.dropTable('rayons');
  },
};
