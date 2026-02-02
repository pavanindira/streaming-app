const db = require('../models');
const Playlist = db.Playlist;
const Song = db.Song;
const logger = require('../utils/logger');

exports.create = async (req, res, next) => {
  try {
    const { name, description, is_public } = req.body;
    const playlist = await Playlist.create({
      name,
      description,
      is_public,
      user_id: req.user.id
    });
    res.status(201).json(playlist);
  } catch (err) {
    next(err);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const playlists = await Playlist.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { user_id: req.user.id },
          { '$collaborators.id$': req.user.id }
        ]
      },
      include: [
        {
          model: Song,
          as: 'songs',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: db.User,
          as: 'collaborators',
          attributes: ['id', 'username', 'profile_picture_url'],
          through: { attributes: [] },
          required: false
        }
      ],
      subQuery: false, // Required for complex includes/where clauses
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(playlists);
  } catch (err) {
    next(err);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id, {
      include: [
        {
          model: Song,
          as: 'songs',
          through: { attributes: [] } // Hide join table attributes
        },
        'user' // Include the creator
      ]
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Authorization check
    if (!playlist.is_public && playlist.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(playlist);
  } catch (err) {
    logger.error(`Error fetching playlist ${req.params.id}: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

exports.addSong = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOne({
      where: { id: req.params.id },
      include: [{
        model: db.User,
        as: 'collaborators',
        attributes: ['id']
      }]
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const isOwner = playlist.user_id === req.user.id;
    const isCollaborator = playlist.collaborators && playlist.collaborators.some(c => c.id === req.user.id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await playlist.addSong(songId);
    res.status(200).json({ message: 'Song added to playlist' });
  } catch (err) {
    next(err);
  }
};

exports.removeSong = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOne({
      where: { id: req.params.id },
      include: [{
        model: db.User,
        as: 'collaborators',
        attributes: ['id']
      }]
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const isOwner = playlist.user_id === req.user.id;
    const isCollaborator = playlist.collaborators && playlist.collaborators.some(c => c.id === req.user.id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await playlist.removeSong(songId);
    res.status(200).json({ message: 'Song removed from playlist' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    await playlist.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const { name, description, is_public } = req.body;
    await playlist.update({ name, description, is_public });
    res.status(200).json(playlist);
  } catch (err) {
    next(err);
  }
};

exports.addCollaborator = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const playlist = await Playlist.findOne({
      where: { id: req.params.id, user_id: req.user.id } // Only owner can invite
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or access denied' });
    }

    const userToAdd = await db.User.findByPk(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User to add not found' });
    }

    await playlist.addCollaborator(userToAdd);
    res.status(200).json({ message: 'Collaborator added successfully' });
  } catch (err) {
    next(err);
  }
};

exports.removeCollaborator = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const playlist = await Playlist.findOne({
      where: { id: req.params.id }
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Only Owner or the Collaborator themselves can remove
    if (playlist.user_id !== req.user.id && parseInt(userId) !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await playlist.removeCollaborator(userId);
    res.status(200).json({ message: 'Collaborator removed successfully' });
  } catch (err) {
    next(err);
  }
};
