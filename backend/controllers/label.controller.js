const { Label, Song } = require('../models');

exports.findAll = async (req, res, next) => {
    try {
        const labels = await Label.findAll({
            order: [['name', 'ASC']]
        });
        res.status(200).json(labels);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { name, color } = req.body;
        const label = await Label.create({ name, color });
        res.status(201).json(label);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Label already exists' });
        }
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const label = await Label.findByPk(req.params.id);
        if (!label) {
            return res.status(404).json({ message: 'Label not found' });
        }
        await label.destroy();
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const label = await Label.findByPk(req.params.id);
        if (!label) {
            return res.status(404).json({ message: 'Label not found' });
        }
        await label.update(req.body);
        res.status(200).json(label);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Label name already exists' });
        }
        next(err);
    }
};
