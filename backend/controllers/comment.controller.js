const { Comment, User, Song, Album } = require('../models');

exports.create = async (req, res, next) => {
    try {
        const { content, songId, albumId } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }
        if (!songId && !albumId) {
            return res.status(400).json({ message: 'Target resource (songId or albumId) is required' });
        }

        const comment = await Comment.create({
            content,
            songId: songId || null,
            albumId: albumId || null,
            userId: req.user.id
        });

        // Return with user info
        const fullComment = await Comment.findByPk(comment.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profile_picture_url'] }]
        });

        res.status(201).json(fullComment);
    } catch (err) {
        next(err);
    }
};

exports.getByResource = async (req, res, next) => {
    try {
        const { songId, albumId } = req.query;
        if (!songId && !albumId) {
            return res.status(400).json({ message: 'Target resource query (songId or albumId) is required' });
        }

        const where = {};
        if (songId) where.songId = songId;
        if (albumId) where.albumId = albumId;

        const comments = await Comment.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profile_picture_url'] }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(comments);

    } catch (err) {
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check ownership or admin
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await comment.destroy();
        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        next(err);
    }
};
