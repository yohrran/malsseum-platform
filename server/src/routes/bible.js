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
      return res.status(400).json({ success: false, error: 'Invalid book abbreviation' });
    }
    if (!CHAPTERS_PATTERN.test(chaptersParam)) {
      return res.status(400).json({ success: false, error: 'Invalid chapters format' });
    }

    const chapterNums = chaptersParam
      .split(',')
      .map(Number)
      .filter((n) => n > 0);

    if (chapterNums.length === 0 || chapterNums.length > 10) {
      return res.status(400).json({ success: false, error: 'Provide 1-10 chapters' });
    }

    const book = await BibleBook.findOne({ abbrKo: bookAbbr });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
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

router.get('/search', async (req, res, next) => {
  try {
    const { q, book: bookFilter } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res
        .status(400)
        .json({ success: false, error: 'Search query must be at least 2 characters' });
    }

    const keyword = q.trim();
    const MAX_RESULTS = 50;

    const query = bookFilter && ABBR_PATTERN.test(bookFilter) ? { abbrKo: bookFilter } : {};

    const books = await BibleBook.find(query).sort({ bookIndex: 1 });

    const results = [];
    for (const book of books) {
      for (let chIdx = 0; chIdx < book.chapters.length && results.length < MAX_RESULTS; chIdx++) {
        const chapter = book.chapters[chIdx];
        for (let vIdx = 0; vIdx < chapter.length && results.length < MAX_RESULTS; vIdx++) {
          if (chapter[vIdx].includes(keyword)) {
            results.push({
              bookAbbr: book.abbrKo,
              bookName: book.nameKo,
              chapter: chIdx + 1,
              verse: vIdx + 1,
              text: chapter[vIdx],
            });
          }
        }
      }
      if (results.length >= MAX_RESULTS) break;
    }

    res.json({
      success: true,
      data: {
        query: keyword,
        total: results.length,
        results,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/bulk', async (req, res, next) => {
  try {
    const books = await BibleBook.find({}).sort({ bookIndex: 1 }).lean();
    const data = books.map((b) => ({
      abbrKo: b.abbrKo,
      nameKo: b.nameKo,
      chapterCount: b.chapterCount,
      chapters: b.chapters,
    }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
