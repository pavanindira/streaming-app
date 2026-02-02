const { User, Song, Album, Artist, Sequelize } = require('../models');
const redisClient = require('../config/redis');

exports.getStats = async (req, res, next) => {
    try {
        // Check Cache
        const cacheKey = 'admin:stats';
        const cachedStats = await redisClient.get(cacheKey);
        if (cachedStats) {
            return res.status(200).json(JSON.parse(cachedStats));
        }

        const [users, songs, albums, artists] = await Promise.all([
            User.count(),
            Song.count(),
            Album.count(),
            User.count({ where: { role: 'artist' } })
        ]);

        // Analytics: User Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Note: For true month-by-month grouping in Postgres/MySQL via Sequelize, raw queries are often easiest.
        // We'll approximate for now or use Sequelize fn/col if supported by DB dialect confidently.
        // Let's use a simple JS mapping for the last 6 months to avoid DB-dialect specific SQL complexity in this demo.
        // Fetch all users created after sixMonthsAgo
        const recentUsers = await User.findAll({
            where: {
                createdAt: {
                    [Sequelize.Op.gte]: sixMonthsAgo
                }
            },
            attributes: ['createdAt']
        });

        // Group by Month
        const userGrowth = {};
        recentUsers.forEach(u => {
            const month = new Date(u.createdAt).toLocaleString('default', { month: 'short' });
            userGrowth[month] = (userGrowth[month] || 0) + 1;
        });
        const userGrowthData = Object.keys(userGrowth).map(name => ({ name, users: userGrowth[name] }));

        // Analytics: Songs by Genre
        // Group by genre
        const songsByGenre = await Song.findAll({
            attributes: ['genre', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            group: ['genre'],
            where: {
                genre: {
                    [Sequelize.Op.ne]: null
                }
            },
            limit: 5
        });

        // Analytics: User Roles
        const userRoles = await User.findAll({
            attributes: ['role', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            group: ['role']
        });

        const result = {
            users,
            songs,
            albums,
            artists,
            analytics: {
                userGrowth: userGrowthData,
                songsByGenre,
                userRoles
            }
        };

        // Cache for 10 minutes (600 seconds)
        await redisClient.setEx(cacheKey, 600, JSON.stringify(result));

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};
