'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Songs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      artist_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      album_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      genre: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      file_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cover_image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      release_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('Songs', {
      fields: ['artist_id'],
      type: 'foreign key',
      name: 'songs_artist_id_fk',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('Songs', {
      fields: ['album_id'],
      type: 'foreign key',
      name: 'songs_album_id_fk',
      references: {
        table: 'Albums',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Songs');
  },
};