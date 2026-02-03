const { Song, Like, Sequelize, User } = require('../models');
const { Op } = Sequelize;
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { s3, bucketName } = require('../config/storage');
const { DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const redisClient = require('../config/redis');

const downloadFile = async (fileUrl, outputDir) => {
  // outputDir is ignored for S3, we use 'songs' folder
  const response = await axios({
    method: 'GET',
    url: fileUrl,
    responseType: 'stream',
  });

  // Try to get extension from content-type or url
  let extension = path.extname(fileUrl).split('?')[0];
  if (!extension) {
    const contentType = response.headers['content-type'];
    if (contentType === 'audio/mpeg') extension = '.mp3';
    else if (contentType === 'audio/wav') extension = '.wav';
    else if (contentType === 'audio/ogg') extension = '.ogg';
    else extension = '.mp3';
  }

  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`;
  const key = `songs/${filename}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: response.data,
      ContentType: response.headers['content-type'] || 'audio/mpeg'
    },
  });

  await upload.done();

  // Return the full URL or Key? 
  // Code expects filename to construct URL later, but here we should probably return Key or Full URL.
  // Existing logic tries to construct URL from filename. 
  // Let's check how it's used.
  // It returns filename.
  // Usage: songData.file_url = `${req.protocol}://${req.get('host')}/uploads/songs/${filename}`;
  // We need to return the S3 URL.

  // Construct S3 URL (assuming public access)
  // If endpoint is localhost, it might be tricky.
  // For MinIO: http://localhost:9000/music-streaming/songs/filename...

  const s3Url = `${process.env.MINIO_ENDPOINT}/${bucketName}/${key}`;
  return { filename, s3Url };
};

exports.create = async (req, res, next) => {
  try {
    const songData = { ...req.body };

    // Automatically assign artistId from logged-in user if they are an artist
    // We assume authMiddleware checks valid token. 
    // Ideally we also check req.user.role === 'artist' but for now we assign it.
    songData.artistId = req.user.id;

    // Handle File Uploads or URL Download
    if (req.files && req.files.file && req.files.file[0]) {
      // Multer-S3 adds 'location' (full URL) and 'key'
      songData.file_url = req.files.file[0].location; // S3 URL

      try {
        const { parseStream } = await import('music-metadata');
        const s3Object = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: req.files.file[0].key }));
        const metadata = await parseStream(s3Object.Body);
        if (metadata.format.duration) {
          songData.duration = Math.round(metadata.format.duration);
        }
      } catch (error) {
        console.error('Error calculating duration (S3):', error);
        if (!songData.duration) songData.duration = 0;
      }

    } else if (req.body.url) {
      // Handle URL Download
      try {
        const { filename, s3Url } = await downloadFile(req.body.url);
        songData.file_url = s3Url;

        if (!songData.duration) songData.duration = 0;

      } catch (error) {
        console.error('Error downloading file from URL:', error);
        return res.status(400).json({ message: 'Failed to download audio file from URL' });
      }
    }

    if (req.files && req.files.cover_image && req.files.cover_image[0]) {
      songData.cover_image_url = req.files.cover_image[0].location;
    }

    const song = await Song.create(songData);

    // Handle Labels
    if (req.body.labels) {
      let labelIds = req.body.labels;
      if (typeof labelIds === 'string') {
        try {
          labelIds = JSON.parse(labelIds);
        } catch (e) {
          if (labelIds.includes(',')) labelIds = labelIds.split(',');
          else labelIds = [labelIds];
        }
      }
      if (Array.isArray(labelIds)) {
        await song.setLabels(labelIds);
      }
    }

    // Invalidate Cache for Songs
    try {
      const keys = await redisClient.keys('songs:*');
      if (keys.length > 0) await redisClient.del(keys);
    } catch (e) { console.error('Redic Invalidation Error', e); }

    // Reload to include associations
    const songWithDetails = await Song.findByPk(song.id, {
      include: ['artist', 'album', 'labels']
    });

    res.status(201).json(songWithDetails);
  } catch (err) {
    next(err);
  }
};

exports.findAll = async (req, res) => {
  try {
    const { albumId, artistId, genre, search, sort, limit } = req.query;
    const where = {};

    if (albumId) where.albumId = albumId;
    if (artistId) where.artistId = artistId;
    if (genre) where.genre = genre;
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    if (req.query.featured === 'true') {
      where.is_featured = true;
    }

    if (req.query.featured === 'true') {
      where.is_featured = true;
    }

    // Check Cache
    const cacheKey = `songs:${JSON.stringify(req.query)}`;
    try {
      const cachedSongs = await redisClient.get(cacheKey);
      if (cachedSongs) {
        return res.status(200).json(JSON.parse(cachedSongs));
      }
    } catch (err) {
      console.error('Redis Get Error:', err.message);
      // Continue to DB fetch
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'random') {
      order = [Sequelize.fn('RANDOM')];
    }

    const songs = await Song.findAll({
      where,
      include: ['artist', 'album', 'labels'],
      order,
      limit: limit ? parseInt(limit) : undefined
    });

    // Set Cache
    // Set Cache
    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(songs));
    } catch (err) {
      console.error('Redis Set Error:', err.message);
    }

    res.status(200).json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching songs.' });
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.status(200).json(song);
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

exports.update = async (req, res, next) => {
  try {
    const song = await Song.findByPk(req.params.id, {
      include: ['artist', 'album', 'labels']
    });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const updateData = { ...req.body };

    // Handle File Uploads
    // Handle File Uploads or URL Download
    if (req.files && req.files.file && req.files.file[0]) {
      updateData.file_url = req.files.file[0].location;
      // Note: Re-calculating duration for update is tricky if not explicitly requested, 
      // but usually if file changes, duration might change. 
      // For simplicity/safety, we'll skip complex duration update here unless needed, 
      // or copy logic if strictly required. 
    } else if (req.body.url && req.body.url !== song.file_url) {
      // Handle URL Download (Only if URL is new/different - fuzzy check)
      // Actually, managing "is this a new URL" is hard without client flag.
      // But if the user provides a URL field in update, we assume they want to change it.
      // If `req.body.url` is just the EXISTING file_url, we shouldn't re-download.
      // Check if req.body.url starts with http(s)://(our-host)/uploads... -> skip
      const currentS3Prefix = `${process.env.MINIO_ENDPOINT}`; // Approximation
      if (!req.body.url.includes(currentS3Prefix)) {
        try {
          const { s3Url } = await downloadFile(req.body.url);
          updateData.file_url = s3Url;
          updateData.duration = 0; // Reset or calculate if possible
        } catch (error) {
          console.error('Error downloading file from URL:', error);
          return res.status(400).json({ message: 'Failed to download audio file from URL' });
        }
      }
    }

    if (req.files && req.files.cover_image && req.files.cover_image[0]) {
      updateData.cover_image_url = req.files.cover_image[0].location;
    }

    // Handle Labels
    if (req.body.labels) {
      // Expecting labels to be a JSON string of array of IDs or names if sent via FormData
      // or just array if JSON body. Since we use FormData, it comes as string.
      let labelIds = req.body.labels;
      if (typeof labelIds === 'string') {
        try {
          labelIds = JSON.parse(labelIds);
        } catch (e) {
          // If not JSON, maybe comma separated? or single value
          if (labelIds.includes(',')) labelIds = labelIds.split(',');
          else labelIds = [labelIds];
        }
      }
      if (Array.isArray(labelIds)) {
        await song.setLabels(labelIds);
      }
    }

    await song.update(updateData);

    // Invalidate Cache
    try {
      const keys = await redisClient.keys('songs:*');
      if (keys.length > 0) await redisClient.del(keys);
    } catch (e) { console.error('Redic Invalidation Error', e); }

    // Reload to include associations
    await song.reload({ include: ['artist', 'album', 'labels'] });

    res.status(200).json(song);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Delete associated files from S3
    if (song.file_url) {
      // Extract key from URL
      // URL: http://localhost:9000/bucket/songs/filename.mp3
      // Key: songs/filename.mp3
      // We can split by bucket name
      const parts = song.file_url.split(`${bucketName}/`);
      if (parts.length > 1) {
        const key = parts[1];
        await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key })).catch(err => console.error("Failed to delete song file from S3", err));
      }
    }
    if (song.cover_image_url) {
      const parts = song.cover_image_url.split(`${bucketName}/`);
      if (parts.length > 1) {
        const key = parts[1];
        await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key })).catch(err => console.error("Failed to delete cover image from S3", err));
      }
    }

    await song.destroy();

    // Invalidate Cache
    try {
      const keys = await redisClient.keys('songs:*');
      if (keys.length > 0) await redisClient.del(keys);
    } catch (e) { console.error('Redic Invalidation Error', e); }

    res.status(204).send();
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

exports.like = async (req, res, next) => {
  try {
    const songId = req.params.id;
    const userId = req.user.id; // from authMiddleware
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const song = await Song.findByPk(songId);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Check if like exists
    const existingLike = await Like.findOne({ where: { songId, userId } });
    if (existingLike) {
      return res.status(400).json({ message: 'Song already liked' });
    }

    await Like.create({ songId, userId });
    res.status(201).json({ message: 'Song liked' });
  } catch (err) {
    next(err);
  }
};

exports.unlike = async (req, res, next) => {
  try {
    const songId = req.params.id;
    const userId = req.user.id;

    const result = await Like.destroy({ where: { songId, userId } });
    if (result === 0) {
      return res.status(404).json({ message: 'Like not found' });
    }

    res.status(200).json({ message: 'Song unliked' });
  } catch (err) {
    next(err);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get list of followed users (artists)
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'Following',
          attributes: ['id']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followedIds = user.Following.map(u => u.id);

    if (followedIds.length === 0) {
      return res.status(200).json([]); // No followed artists, empty feed
    }

    // Fetch songs from these artists
    const songs = await Song.findAll({
      where: {
        artist_id: {
          [Op.in]: followedIds
        }
      },
      include: ['artist', 'album', 'labels'],
      order: [['createdAt', 'DESC']],
      limit: 50 // Limit feed size for now
    });

    res.status(200).json(songs);
  } catch (err) {
    next(err);
  }
};

exports.getGenres = async (req, res, next) => {
  try {
    // Check Cache
    const cacheKey = 'genres';
    try {
      const cachedGenres = await redisClient.get(cacheKey);
      if (cachedGenres) {
        return res.status(200).json(JSON.parse(cachedGenres));
      }
    } catch (err) {
      console.error('Redis Get Error:', err.message);
    }

    const songs = await Song.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('genre')), 'genre']],
      where: {
        genre: { [Op.ne]: null }
      },
      order: [['genre', 'ASC']]
    });

    const genres = songs.map(song => song.genre).filter(g => g);

    // Set Cache
    try {
      await redisClient.setEx(cacheKey, 86400, JSON.stringify(genres)); // Cache for 24h
    } catch (err) {
      console.error('Redis Set Error:', err.message);
    }

    res.status(200).json(genres);
  } catch (err) {
    next(err);
  }
};