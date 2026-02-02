module.exports = (sequelize, DataTypes) => {
    const PlaylistCollaborator = sequelize.define('PlaylistCollaborator', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        playlist_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Playlists',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'PlaylistCollaborators',
        timestamps: true,
        createdAt: 'added_at',
        updatedAt: false
    });

    return PlaylistCollaborator;
};
