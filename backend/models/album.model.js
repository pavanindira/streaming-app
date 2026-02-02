module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define(
    'Album',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      artist_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cover_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      upc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      album_type: {
        type: DataTypes.ENUM('Single', 'EP', 'Album', 'Compilation'),
        defaultValue: 'Album',
      },
      copyright_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_tracks: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'Albums',
      underscored: true,
    }
  );

  Album.associate = (models) => {
    Album.belongsTo(models.User, { foreignKey: 'artist_id', as: 'artist' });
    Album.hasMany(models.Song, { foreignKey: 'album_id', as: 'songs' });
  };

  return Album;
};