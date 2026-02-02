module.exports = (sequelize, DataTypes) => {
    const AudiobookProgress = sequelize.define(
        'AudiobookProgress',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true, // Part of composite PK
            },
            audiobook_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true, // Part of composite PK
            },
            progress_seconds: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            is_completed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            last_listened_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'AudiobookProgress',
            underscored: true,
            timestamps: false, // We manage last_listened_at manually or via default
        }
    );

    AudiobookProgress.associate = (models) => {
        AudiobookProgress.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        AudiobookProgress.belongsTo(models.Audiobook, { foreignKey: 'audiobook_id', as: 'audiobook' });
    };

    return AudiobookProgress;
};
