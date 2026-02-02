'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('UserFollowers');

    // Create the table if it doesn't exist
    if (!tableDescription) {
      await queryInterface.createTable('UserFollowers', {
        follower_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        followee_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        followed_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Add foreign key constraints
      await queryInterface.addConstraint('UserFollowers', {
        fields: ['follower_id'],
        type: 'foreign key',
        name: 'userfollowers_follower_id_fk',
        references: {
          table: 'Users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      await queryInterface.addConstraint('UserFollowers', {
        fields: ['followee_id'],
        type: 'foreign key',
        name: 'userfollowers_followee_id_fk',
        references: {
          table: 'Users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Add primary key constraint
      await queryInterface.addConstraint('UserFollowers', {
        fields: ['follower_id', 'followee_id'],
        type: 'primary key',
        name: 'userfollowers_pk',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserFollowers');
  },
};