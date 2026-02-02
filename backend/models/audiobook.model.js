module.exports = (sequelize, DataTypes) => {
    const Audiobook = sequelize.define(
        'Audiobook',
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            author: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            narrator: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            duration: {
                type: DataTypes.INTEGER, // in seconds
                allowNull: false,
                defaultValue: 0,
            },
            file_url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            cover_image_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            release_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            category_id: { // Keeping it simple for now, can be associated with a Category model later
                type: DataTypes.INTEGER,
                allowNull: true,
            }
        },
        {
            tableName: 'Audiobooks',
            underscored: true,
        }
    );

    Audiobook.associate = (models) => {
        // Associations can be added here
        Audiobook.hasMany(models.AudiobookProgress, { foreignKey: 'audiobook_id', as: 'progress' });
    };

    return Audiobook;
};
