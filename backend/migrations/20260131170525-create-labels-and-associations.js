'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create Labels Table
    await queryInterface.createTable('Labels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      color: {
        type: Sequelize.STRING, // e.g., hex code or tailwind class
        defaultValue: '#3b82f6' // Default blue
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 2. Create SongLabels (Join Table)
    await queryInterface.createTable('SongLabels', {
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      song_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Songs',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      label_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Labels',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SongLabels');
    await queryInterface.dropTable('Labels');
  }
};
