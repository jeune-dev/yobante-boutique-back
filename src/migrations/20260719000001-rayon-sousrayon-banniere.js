'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rayons', {
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
    await queryInterface.createTable('sous_rayons', {
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
    await queryInterface.createTable('banniere_produits', {
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
    await queryInterface.addColumn('produits', 'rayonId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'rayons', key: 'id' },
    });
    await queryInterface.addColumn('produits', 'sousRayonId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'sous_rayons', key: 'id' },
    });
    await queryInterface.addColumn('users', 'mustChangePassword', {
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
