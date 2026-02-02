const { Song, Album, Artist, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.search = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const [songs, albums, artists] = await Promise.all([
            Song.findAll({
                where: { title: { [Op.iLike]: `%${q}%` } },
                include: ['artist', 'album'],
                limit: 10
            }),
            Album.findAll({
                where: { title: { [Op.iLike]: `%${q}%` } },
                include: ['artist'],
                limit: 10
            }),
            Artist.findAll({
                where: { name: { [Op.iLike]: `%${q}%` } },
                limit: 10
            })
        ]);

        res.status(200).json({
            songs,
            albums,
            artists
        });
    } catch (err) {
        next(err);
    }
};
