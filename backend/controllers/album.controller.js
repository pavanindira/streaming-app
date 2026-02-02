const { Album, Song, User, Sequelize } = require('../models');
const { Op } = Sequelize;
const logger = require('../utils/logger');
const redisClient = require('../config/redis');

exports.create = async (req, res, next) => {
  try {
    const albumData = { ...req.body };
    albumData.artist_id = req.user.id; // Assign to logged-in user

    if (req.file) {
      albumData.cover_image_url = `${req.protocol}://${req.get('host')}/uploads/albums/${req.file.filename}`;
    }

    const album = await Album.create(albumData);

    // Invalidate all album caches
    try {
      const keys = await redisClient.keys('albums:*');
      if (keys.length > 0) await redisClient.del(keys);
    } catch (e) {
      console.error('Redis Invalidation Error', e);
    }

    res.status(201).json(album);
  } catch (err) {
    next(err);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    // Simple caching for default call. If pagination differs, we might skip cache or key by page.
    // For now, caching only the 'all' or default view if no complex filters. 
    // Actually, widespread caching with pagination is complex. 
    // Let's cache the "feature" or "all" list if page=1.

    const cacheKey = `albums:${JSON.stringify(req.query)}`;
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
    } catch (err) {
      console.warn('Redis Get Error:', err.message);
    }

    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.featured === 'true') {
      where.is_featured = true;
    }

    const albums = await Album.findAndCountAll({
      where,
      include: [
        { model: Song, as: 'songs' },
        { model: User, as: 'artist', attributes: ['id', 'name', 'profile_picture_url'] },
      ],
      limit,
      offset,
    });

    const result = {
      total: albums.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: albums.rows,
    };

    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
    } catch (err) {
      console.warn('Redis Set Error:', err.message);
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const album = await Album.findByPk(req.params.id, {
      include: [
        { model: Song, as: 'songs', attributes: ['id', 'title', 'duration', 'file_url', 'cover_image_url', 'artist_id'] },
        { model: User, as: 'artist', attributes: ['id', 'name', 'bio', 'profile_picture_url'] },
      ],
    });

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.status(200).json(album);
  } catch (err) {
    next(err);
  }
};

exports.updateAlbum = async (req, res, next) => {
  try {
    const album = await Album.findByPk(req.params.id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Authorization check
    if (album.artist_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this album' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.cover_image_url = `${req.protocol}://${req.get('host')}/uploads/albums/${req.file.filename}`;
    }
    await album.update(updateData);

    // Invalidate all album caches since we key by query params
    // Ideally we use scan to find keys, but flush might be safer or just rely on expiry if volume is low.
    // Actually, let's just delete the main ones or use a namespace approach if Redis version supports it.
    // For simplicity, we won't verify perfect invalidation of every pagination page, but we should try.
    // Or we just don't cache pagination? 
    // Let's doing simple invalidation for now.

    // We can't easily know all keys. 
    // Alternative: Use a 'version' key for albums and append to all keys?
    // Or just cache the *home page* specific queries commonly used.

    // For this task, let's clear what we can guess or use `keys` (slow) or `scan`.
    // Since this is "Technical Polish", let's use a pattern delete helper if we had one.
    // I'll just clear the common `albums:{"page":"1","limit":"10"}` etc. 
    // or better, just don't cache deeply paginated results.

    // Hack: for now, just expire the keys if we knew them. 
    // We will just let them expire for now EXCEPT the main list if we can.
    // Actually, users want to see updates. 
    // Let's flush DB 0? No, that clears user sessions too (if stored there).

    // Let's implement a simple wildcard delete helper later. 
    // For now, I'll delete the most common key or assume short TTL.
    // But implementation plan said "Invalidate cache".

    // Basic Implementation:
    // keys = await client.keys('albums:*');
    // if (keys.length > 0) await client.del(keys);

    try {
      const keys = await redisClient.keys('albums:*');
      if (keys.length > 0) await redisClient.del(keys);
    } catch (e) { console.error('Redis Invalidation Error', e); }

    res.status(200).json(album);
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

exports.deleteAlbum = async (req, res, next) => {
  try {
    const album = await Album.findByPk(req.params.id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Authorization check
    if (album.artist_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this album' });
    }

    await album.destroy();

    try {
      const keys = await redisClient.keys('albums:*');
      if (keys.length > 0) await redisClient.del(keys);
    } catch (e) { console.error('Redis Invalidation Error', e); }

    res.status(200).json({ message: 'Album deleted successfully' });
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};