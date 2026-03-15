const express = require('express');
const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET all bookmarks for user
router.get('/', async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
});

// GET bookmarks for specific chapter
router.get('/:bookId/:chapter', async (req, res, next) => {
  try {
    const { bookId, chapter } = req.params;
    const bookmarks = await Bookmark.find({
      userId: req.user._id,
      bookId,
      chapter: Number(chapter),
    });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
});

// POST toggle bookmark
router.post('/', async (req, res, next) => {
  try {
    const { bookId, chapter, verse, note } = req.body;
    if (!bookId || !chapter || !verse) {
      return res
        .status(400)
        .json({ success: false, error: 'bookId, chapter, and verse are required' });
    }

    const existing = await Bookmark.findOne({
      userId: req.user._id,
      bookId,
      chapter,
      verse,
    });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.json({ success: true, data: null, message: 'Bookmark removed' });
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      bookId,
      chapter,
      verse,
      note: note || '',
    });
    res.status(201).json({ success: true, data: bookmark });
  } catch (err) {
    next(err);
  }
});

// PATCH bookmark (note and/or tags)
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, tags } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    const update = {};
    if (typeof note === 'string') update.note = note;
    if (Array.isArray(tags)) {
      update.tags = tags
        .filter((t) => typeof t === 'string')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 10);
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: 'note or tags required' });
    }

    const bookmark = await Bookmark.findOneAndUpdate({ _id: id, userId: req.user._id }, update, {
      new: true,
    });
    if (!bookmark) {
      return res.status(404).json({ success: false, error: 'Bookmark not found' });
    }
    res.json({ success: true, data: bookmark });
  } catch (err) {
    next(err);
  }
});

// GET all tags for user
router.get('/tags/all', async (req, res, next) => {
  try {
    const tags = await Bookmark.distinct('tags', { userId: req.user._id });
    res.json({ success: true, data: tags.sort() });
  } catch (err) {
    next(err);
  }
});

// GET bookmarks by tag
router.get('/tags/:tag', async (req, res, next) => {
  try {
    const { tag } = req.params;
    const bookmarks = await Bookmark.find({
      userId: req.user._id,
      tags: tag.toLowerCase(),
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
});

// DELETE bookmark
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    await Bookmark.deleteOne({ _id: id, userId: req.user._id });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
