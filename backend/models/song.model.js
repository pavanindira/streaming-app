module.exports = (sequelize, DataTypes) => {
  const Song = sequelize.define(
    'Song',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      artist_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      album_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lyrics: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      singer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lyricist: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isrc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      track_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      disc_number: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      explicit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      composer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      producer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cover_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'Songs',
      underscored: true,
    }
  );

  Song.associate = (models) => {
    Song.belongsTo(models.User, { foreignKey: 'artist_id', as: 'artist' });
    Song.belongsTo(models.Album, { foreignKey: 'album_id', as: 'album' });
    Song.belongsToMany(models.Playlist, {
      through: 'PlaylistSongs',
      foreignKey: 'song_id',
      otherKey: 'playlist_id',
      as: 'playlists'
    });
    Song.belongsToMany(models.Label, {
      through: 'SongLabels',
      foreignKey: 'song_id',
      otherKey: 'label_id',
      as: 'labels',
    });
    Song.hasMany(models.Like, { foreignKey: 'songId', as: 'likes' });
    Song.belongsToMany(models.User, { through: models.Like, as: 'likedBy', foreignKey: 'songId' });
  };

  return Song;
};