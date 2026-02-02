const { Audiobook, AudiobookProgress, User } = require('../models');

exports.create = async (req, res, next) => {
  try {
    const audiobook = await Audiobook.create(req.body);
    res.status(201).json(audiobook);
  } catch (err) {
    next(err);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const audiobooks = await Audiobook.findAll();
    res.status(200).json(audiobooks);
  } catch (err) {
    next(err);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const audiobook = await Audiobook.findByPk(req.params.id);
    if (!audiobook) {
      return res.status(404).json({ message: 'Audiobook not found' });
    }
    res.status(200).json(audiobook);
  } catch (err) {
    next(err);
  }
};

exports.updateAudiobook = async (req, res, next) => {
  try {
    const audiobook = await Audiobook.findByPk(req.params.id);
    if (!audiobook) {
      return res.status(404).json({ message: 'Audiobook not found' });
    }

    await audiobook.update(req.body);
    res.status(200).json(audiobook);
  } catch (err) {
    next(err);
  }
};

exports.deleteAudiobook = async (req, res, next) => {
  try {
    const audiobook = await Audiobook.findByPk(req.params.id);
    if (!audiobook) {
      return res.status(404).json({ message: 'Audiobook not found' });
    }

    await audiobook.destroy();
    res.status(200).json({ message: 'Audiobook deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From authMiddleware

    const progress = await AudiobookProgress.findOne({
      where: { audiobook_id: id, user_id: userId }
    });

    if (!progress) {
      // Default to 0 if no progress found
      return res.status(200).json({ progress_seconds: 0, is_completed: false });
    }

    res.status(200).json(progress);
  } catch (err) {
    next(err);
  }
};

exports.saveProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { progress_seconds, is_completed } = req.body;

    // Validate inputs (basic)
    if (progress_seconds === undefined) {
      return res.status(400).json({ message: 'progress_seconds is required' });
    }

    // Upsert progress
    const [progress, created] = await AudiobookProgress.upsert({
      audiobook_id: id,
      user_id: userId,
      progress_seconds,
      is_completed: is_completed || false,
      last_listened_at: new Date()
    });

    res.status(200).json({ message: 'Progress saved', progress });
  } catch (err) {
    next(err);
  }
};