const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const register = async (req, res) => {
  const { username, name, email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create the user
    const user = await User.create({
      username,
      name,
      email,
      password_hash: password, // Sequelize hook will hash this
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error during registration:', error); // Log the error
    res.status(500).json({ message: 'An error occurred during registration', error: error.message });
  }
};

const create = async (req, res) => {
  const { username, name, email, password, role } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create the user
    const user = await User.create({
      username,
      name,
      email,
      password_hash: password, // Sequelize hook will hash this
      role: role || 'listener' // Default to listener if not specified
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error during user creation:', error);
    res.status(500).json({ message: 'An error occurred during user creation', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last_login field
    user.last_login = new Date();
    await user.save(); // Save the updated user instance to the database

    console.log('Last login updated:', user.last_login);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, user, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login', error: error.message });
  }
};

const update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedData = { ...req.body };
    if (req.body.password) {
      updatedData.password_hash = await bcrypt.hash(req.body.password, 10);
    }

    await user.update(updatedData);
    res.status(200).json(user);
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

const findOne = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

const findAll = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

const getOne = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'name', 'bio', 'profile_picture_url', 'role', 'createdAt'],
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: db.Song,
          as: 'favorites',
          attributes: ['id', 'title', 'cover_image_url', 'artist_id', 'album_id'],
          include: ['artist'], // Use string alias if defined in model, or object. Song usually belongsTo Artist. checking song.model might be safer but 'artist' is common.
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const output = user.toJSON();
    output.followerCount = output.Followers ? output.Followers.length : 0;

    // Check if current user is following
    output.isFollowing = false;
    if (req.user) { // Assuming authMiddleware runs before this or optionally
      // We can check if req.user.id is in the followers list
      // Note: For large follower counts, fetching all IDs is inefficient. 
      // Ideally we use a separate query or Sequelize literal, but for now this is okay.
      output.isFollowing = output.Followers.some(f => f.id === req.user.id);
    }

    delete output.Followers; // Don't send the full list

    res.status(200).json(output);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id); // Use the ID from `req.user`

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: db.Song,
          as: 'favorites',
          include: ['artist', 'album'],
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.favorites);
  } catch (err) {
    next(err);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const song = await db.Song.findByPk(req.params.songId);

    if (!user || !song) {
      return res.status(404).json({ message: 'User or Song not found' });
    }

    await user.addFavorite(song);
    res.status(200).json({ message: 'Added to favorites' });
  } catch (err) {
    next(err);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const song = await db.Song.findByPk(req.params.songId);

    if (!user || !song) {
      return res.status(404).json({ message: 'User or Song not found' });
    }

    await user.removeFavorite(song);
    res.status(200).json({ message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
};

const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId == currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findByPk(currentUserId);
    await currentUser.addFollowing(targetUser);

    res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    next(err);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const currentUser = await User.findByPk(currentUserId);
    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await currentUser.removeFollowing(targetUser);

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    next(err);
  }
};

// Check if following in getOne (optional, dependent on how we want to fetch this)
// For now, simple follow/unfollow is sufficient.

// Swagger documentation
module.exports = {
  update,
  findOne,
  findAll,
  deleteUser,
  login,
  register,
  create,
  getMe,
  getFavorites,
  addFavorite,
  removeFavorite,
  getFavorites,
  addFavorite,
  removeFavorite,
  followUser,
  unfollowUser,
  getOne
};