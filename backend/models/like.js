'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Like extends Model {
        static associate(models) {
            // Define associations here if needed, but usually handled in User/Song
            Like.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Like.belongsTo(models.Song, { foreignKey: 'songId', as: 'song' });
        }
    }
    Like.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        songId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Like',
    });
    return Like;
};
