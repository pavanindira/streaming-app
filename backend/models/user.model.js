const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true, // Optional for artists
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'artist', 'admin', 'moderator'),
        allowNull: false,
        defaultValue: 'user',
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional for regular users
      },
      profile_picture_url: {
        type: DataTypes.STRING,
        allowNull: true, // Optional for regular users
      },
      subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Only for regular users
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'Users',
      paranoid: true, // Enables soft delete
      timestamps: true,
      underscored: true,
    }
  );

  // Remove the double hashing in hooks
  User.beforeCreate(async (user) => {
    if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
  });

  // Add a method to verify the password
  User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  User.associate = (models) => {
    // If artists have albums or songs, define associations here
    User.hasMany(models.Album, { foreignKey: 'artist_id', as: 'albums' });
    User.hasMany(models.Song, { foreignKey: 'artist_id', as: 'songs' });
    User.hasMany(models.Playlist, { foreignKey: 'user_id', as: 'playlists' });
    User.hasMany(models.Like, { foreignKey: 'userId', as: 'likes' });
    User.belongsToMany(models.Song, { through: models.Like, as: 'favorites', foreignKey: 'userId' });

    // Self-referencing Many-to-Many for Followers/Following
    User.belongsToMany(models.User, { as: 'Followers', through: 'UserFollowers', foreignKey: 'followee_id', otherKey: 'follower_id' });
    User.belongsToMany(models.User, { as: 'Following', through: 'UserFollowers', foreignKey: 'follower_id', otherKey: 'followee_id' });
    User.belongsToMany(models.Playlist, {
      through: 'PlaylistCollaborators',
      foreignKey: 'user_id',
      otherKey: 'playlist_id',
      as: 'collaborations'
    });
  };

  return User;
};