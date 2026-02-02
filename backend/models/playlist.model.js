module.exports = (sequelize, DataTypes) => {
  const Playlist = sequelize.define('Playlist', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'Playlists',
    timestamps: true,
  });

  // Associations
  Playlist.associate = (models) => {
    Playlist.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
    Playlist.belongsToMany(models.Song, {
      through: 'PlaylistSongs',
      foreignKey: 'playlist_id',
      otherKey: 'song_id',
      as: 'songs'
    });
    Playlist.belongsToMany(models.User, {
      through: 'PlaylistCollaborators',
      foreignKey: 'playlist_id',
      otherKey: 'user_id',
      as: 'collaborators'
    });
  };

  return Playlist;
};