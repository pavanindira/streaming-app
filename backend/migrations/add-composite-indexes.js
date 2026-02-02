'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the index exists before adding it
    const albumsIndexes = await queryInterface.showIndex('Albums');
    const songsIndexes = await queryInterface.showIndex('Songs');
    const analyticsIndexes = await queryInterface.showIndex('Analytics');
    const commentsIndexes = await queryInterface.showIndex('Comments');
    const playlistsIndexes = await queryInterface.showIndex('Playlists');
    const userFollowersIndexes = await queryInterface.showIndex('UserFollowers');

    // Add composite index for Albums table
    if (!albumsIndexes.some(index => index.name === 'artist_release_date_index')) {
      await queryInterface.addIndex('Albums', ['artist_id', 'release_date'], {
        name: 'artist_release_date_index',
      });
    }

    // Add composite index for Songs table
    if (!songsIndexes.some(index => index.name === 'artist_album_index')) {
      await queryInterface.addIndex('Songs', ['artist_id', 'album_id'], {
        name: 'artist_album_index',
      });
    }

    // Add index for Analytics table
    if (!analyticsIndexes.some(index => index.name === 'event_type_index')) {
      await queryInterface.addIndex('Analytics', ['event_type'], {
        name: 'event_type_index',
      });
    }

    // Add composite index for Comments table
    if (!commentsIndexes.some(index => index.name === 'user_song_index')) {
      await queryInterface.addIndex('Comments', ['user_id', 'song_id'], {
        name: 'user_song_index',
      });
    }

    // Add composite index for Playlists table
    if (!playlistsIndexes.some(index => index.name === 'user_public_index')) {
      await queryInterface.addIndex('Playlists', ['user_id', 'is_public'], {
        name: 'user_public_index',
      });
    }

    // Add composite index for UserFollowers table
    if (!userFollowersIndexes.some(index => index.name === 'follower_followee_index')) {
      await queryInterface.addIndex('UserFollowers', ['follower_id', 'followee_id'], {
        name: 'follower_followee_index',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove composite index for Albums table
    await queryInterface.removeIndex('Albums', 'artist_release_date_index');

    // Remove composite index for Songs table
    await queryInterface.removeIndex('Songs', 'artist_album_index');

    // Remove index for Analytics table
    await queryInterface.removeIndex('Analytics', 'event_type_index');

    // Remove composite index for Comments table
    await queryInterface.removeIndex('Comments', 'user_song_index');

    // Remove composite index for Playlists table
    await queryInterface.removeIndex('Playlists', 'user_public_index');

    // Remove composite index for UserFollowers table
    await queryInterface.removeIndex('UserFollowers', 'follower_followee_index');
  },
};