module.exports = (sequelize, DataTypes) => {
    const Label = sequelize.define(
        'Label',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            color: {
                type: DataTypes.STRING,
                defaultValue: '#3b82f6',
            },
        },
        {
            tableName: 'Labels',
            underscored: true,
        }
    );

    Label.associate = (models) => {
        Label.belongsToMany(models.Song, {
            through: 'SongLabels',
            foreignKey: 'label_id',
            otherKey: 'song_id',
            as: 'songs',
        });
    };

    return Label;
};
