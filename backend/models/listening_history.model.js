module.exports = (sequelize, DataTypes) => {
    const ListeningHistory = sequelize.define(
        'ListeningHistory',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            song_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            played_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'ListeningHistory',
            underscored: true,
            timestamps: true, // we can use createdAt as played_at, but separate field is explicit
        }
    );

    ListeningHistory.associate = (models) => {
        ListeningHistory.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        ListeningHistory.belongsTo(models.Song, { foreignKey: 'song_id', as: 'song' });
    };

    return ListeningHistory;
};
