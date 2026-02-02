module.exports = (sequelize, DataTypes) => {
    const Artist = sequelize.define(
        'Artist',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            bio: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'Artists',
            underscored: true,
        }
    );

    Artist.associate = (models) => {
        Artist.hasMany(models.Album, { foreignKey: 'artist_id', as: 'albums' });
        Artist.hasMany(models.Song, { foreignKey: 'artist_id', as: 'songs' });
    };

    return Artist;
};
