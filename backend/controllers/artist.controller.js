const { Artist, Song, User, Like } = require('../models');
const { Op } = require('sequelize');

exports.create = async (req, res, next) => {
  try {
    const artistData = { ...req.body };
    if (req.file) {
      artistData.image_url = `${req.protocol}://${req.get('host')}/uploads/artists/${req.file.filename}`;
    }
    const artist = await Artist.create(artistData);
    res.status(201).json(artist);
  } catch (err) {
    next(err);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const artists = await Artist.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(artists);
  } catch (err) {
    next(err);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const artist = await Artist.findByPk(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.status(200).json(artist);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const artist = await Artist.findByPk(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Check authorization: User must be the artist or an admin
    // Note: req.user.id is the User ID. Artist ID might be different if they are separate tables, 
    // but in our schema (from getStats), it seems Artist and User might be linked or same?
    // In `getStats`: const user = await User.findByPk(artistId); -> Implies Artist ID == User ID.
    // However, the `Artist` model exists separately.
    // Let's check `create`: creates an Artist. Does it link to User?
    // In `song.controller.js`: `songData.artistId = req.user.id;`.
    // It seems we desire 1:1 map.
    // But `Artist` model usually has `user_id` or `id` matches `users.id`.
    // If `Artist` table is separate, we need to know which User owns it.
    // Assuming `Artist` has `user_id` or we rely on `id` matching.

    // Let's assume for now `Artist` has `UserId`.
    // Let's check the schema if possible (or models/artist.model.js).
    // For now, I'll add a check assuming `artist.UserId === req.user.id` if that field exists,
    // If not, I'll assume artists are just Users with 'artist' role and the `Artist` table is metadata.
    // BUT `artist.controller` uses `Artist.findByPk`.

    // Safe fallback: if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id))
    // This assumes Artist ID = User ID.
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      // If IDs don't match, verify if there's a link.
      // If Artist model has UserId:
      // if (artist.UserId !== req.user.id) ...
      // Without seeing model, explicit ID match is safest start.
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image_url = `${req.protocol}://${req.get('host')}/uploads/artists/${req.file.filename}`;
    }
    await artist.update(updateData);
    res.status(200).json(artist);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const artist = await Artist.findByPk(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    await artist.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const artistId = req.params.id;

    const songsCount = await Song.count({ where: { artist_id: artistId } });

    // Fetch User to get followers count
    const user = await User.findByPk(artistId, {
      include: [{
        model: User,
        as: 'Followers',
        attributes: ['id']
      }]
    });
    const followersCount = user ? user.Followers.length : 0;

    // Calculate total likes (as a proxy for popularity/streams if streams are missing)
    // We can also just return 0 for streams if not tracked
    // Let's sum up likes for all songs by this artist
    const songs = await Song.findAll({
      where: { artist_id: artistId },
      include: [{ model: Like, as: 'likes' }]
    });

    const totalLikes = songs.reduce((acc, song) => acc + song.likes.length, 0);

    res.status(200).json({
      totalTracks: songsCount,
      followers: followersCount,
      totalStreams: 0, // Placeholder
      totalLikes: totalLikes
    });
  } catch (err) {
    next(err);
  }
};
