module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // Polymorphic association or specific fields?
        // Plan said: songId, albumId.
        songId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Songs',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        albumId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Albums',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Assuming table name is Users
                key: 'id'
            },
            onDelete: 'CASCADE'
        }
    }, {
        timestamps: true
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Comment.belongsTo(models.Song, { foreignKey: 'songId', as: 'song' });
        Comment.belongsTo(models.Album, { foreignKey: 'albumId', as: 'album' });
    };

    return Comment;
};
