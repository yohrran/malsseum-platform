const express = require('express');
const { authenticate } = require('../middleware/auth');
const BibleBook = require('../models/BibleBook');

const router = express.Router();

const ABBR_PATTERN = /^[\uAC00-\uD7A3a-zA-Z0-9]{1,4}$/;
const CHAPTERS_PATTERN = /^[0-9,]+$/;

router.use(authenticate);

router.get('/books', async (req, res, next) => {
  try {
    const books = await BibleBook.find({}, { chapters: 0 }).sort({
      bookIndex: 1,
    });
    const data = books.map((b) => ({
      abbrKo: b.abbrKo,
      nameKo: b.nameKo,
      chapterCount: b.chapterCount,
    }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/passage/:bookAbbr/:chapters', async (req, res, next) => {
  try {
    const { bookAbbr, chapters: chaptersParam } = req.params;

    if (!ABBR_PATTERN.test(bookAbbr)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid book abbreviation' });
    }
    if (!CHAPTERS_PATTERN.test(chaptersParam)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid chapters format' });
    }

    const chapterNums = chaptersParam
      .split(',')
      .map(Number)
      .filter((n) => n > 0);

    if (chapterNums.length === 0 || chapterNums.length > 10) {
      return res
        .status(400)
        .json({ success: false, error: 'Provide 1-10 chapters' });
    }

    const book = await BibleBook.findOne({ abbrKo: bookAbbr });
    if (!book) {
      return res
        .status(404)
        .json({ success: false, error: 'Book not found' });
    }

    const chaptersData = chapterNums
      .filter((ch) => ch >= 1 && ch <= book.chapterCount)
      .map((ch) => ({
        chapter: ch,
        verses: book.chapters[ch - 1].map((text, idx) => ({
          verse: idx + 1,
          text,
        })),
      }));

    res.json({
      success: true,
      data: {
        bookName: book.nameKo,
        abbrKo: book.abbrKo,
        chapters: chaptersData,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
