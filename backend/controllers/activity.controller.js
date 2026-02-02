const { ListeningHistory, User, Song, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.logPlay = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { songId } = req.body;

        if (!songId) {
            return res.status(400).json({ message: 'Song ID is required' });
        }

        await ListeningHistory.create({
            user_id: userId,
            song_id: songId,
        });

        res.status(201).json({ message: 'Play logged' });
    } catch (err) {
        next(err);
    }
};

exports.getFriendActivity = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get users that the current user follows
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: User,
                    as: 'Following',
                    attributes: ['id'],
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const followedIds = user.Following.map((u) => u.id);

        if (followedIds.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch latest plays from these users
        const activity = await ListeningHistory.findAll({
            where: {
                user_id: {
                    [Op.in]: followedIds,
                },
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'profile_picture_url'],
                },
                {
                    model: Song,
                    as: 'song',
                    attributes: ['id', 'title', 'cover_image_url'], // Minimal song info
                    include: [
                        {
                            model: User,
                            as: 'artist',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 20,
        });

        res.status(200).json(activity);
    } catch (err) {
        next(err);
    }
};
