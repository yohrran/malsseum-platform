const express = require('express');
const Highlight = require('../models/Highlight');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const VALID_COLORS = ['yellow', 'green', 'blue', 'pink', 'purple'];

// GET highlights for specific chapter
router.get('/:bookId/:chapter', async (req, res, next) => {
  try {
    const { bookId, chapter } = req.params;
    const highlights = await Highlight.find({
      userId: req.user._id,
      bookId,
      chapter: Number(chapter),
    });
    res.json({ success: true, data: highlights });
  } catch (err) {
    next(err);
  }
});

// PUT upsert highlight (set or change color)
router.put('/', async (req, res, next) => {
  try {
    const { bookId, chapter, verse, color } = req.body;
    if (!bookId || !chapter || !verse || !color) {
      return res
        .status(400)
        .json({ success: false, error: 'bookId, chapter, verse, and color are required' });
    }
    if (!VALID_COLORS.includes(color)) {
      return res
        .status(400)
        .json({ success: false, error: `color must be one of: ${VALID_COLORS.join(', ')}` });
    }

    const highlight = await Highlight.findOneAndUpdate(
      { userId: req.user._id, bookId, chapter, verse },
      { color },
      { upsert: true, new: true },
    );
    res.json({ success: true, data: highlight });
  } catch (err) {
    next(err);
  }
});

// DELETE highlight
router.delete('/:bookId/:chapter/:verse', async (req, res, next) => {
  try {
    const { bookId, chapter, verse } = req.params;
    await Highlight.deleteOne({
      userId: req.user._id,
      bookId,
      chapter: Number(chapter),
      verse: Number(verse),
    });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
