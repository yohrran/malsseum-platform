import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import BibleBook from '../models/BibleBook';

const router = Router();
router.use(authenticate);

type CuratedVerse = { bookAbbr: string; chapter: number; verse: number };

const CURATED_VERSES: CuratedVerse[] = [
  { bookAbbr: '창', chapter: 1, verse: 1 },
  { bookAbbr: '시', chapter: 23, verse: 1 },
  { bookAbbr: '시', chapter: 46, verse: 1 },
  { bookAbbr: '시', chapter: 91, verse: 1 },
  { bookAbbr: '시', chapter: 119, verse: 105 },
  { bookAbbr: '시', chapter: 121, verse: 1 },
  { bookAbbr: '시', chapter: 139, verse: 14 },
  { bookAbbr: '잠', chapter: 3, verse: 5 },
  { bookAbbr: '잠', chapter: 3, verse: 6 },
  { bookAbbr: '잠', chapter: 16, verse: 3 },
  { bookAbbr: '사', chapter: 40, verse: 31 },
  { bookAbbr: '사', chapter: 41, verse: 10 },
  { bookAbbr: '사', chapter: 43, verse: 19 },
  { bookAbbr: '렘', chapter: 29, verse: 11 },
  { bookAbbr: '렘', chapter: 33, verse: 3 },
  { bookAbbr: '마', chapter: 5, verse: 14 },
  { bookAbbr: '마', chapter: 6, verse: 33 },
  { bookAbbr: '마', chapter: 7, verse: 7 },
  { bookAbbr: '마', chapter: 11, verse: 28 },
  { bookAbbr: '마', chapter: 28, verse: 20 },
  { bookAbbr: '요', chapter: 1, verse: 1 },
  { bookAbbr: '요', chapter: 3, verse: 16 },
  { bookAbbr: '요', chapter: 8, verse: 32 },
  { bookAbbr: '요', chapter: 14, verse: 6 },
  { bookAbbr: '요', chapter: 14, verse: 27 },
  { bookAbbr: '요', chapter: 15, verse: 5 },
  { bookAbbr: '롬', chapter: 8, verse: 28 },
  { bookAbbr: '롬', chapter: 8, verse: 38 },
  { bookAbbr: '롬', chapter: 12, verse: 2 },
  { bookAbbr: '고전', chapter: 10, verse: 13 },
  { bookAbbr: '고전', chapter: 13, verse: 4 },
  { bookAbbr: '고전', chapter: 13, verse: 13 },
  { bookAbbr: '고후', chapter: 5, verse: 17 },
  { bookAbbr: '고후', chapter: 12, verse: 9 },
  { bookAbbr: '갈', chapter: 2, verse: 20 },
  { bookAbbr: '갈', chapter: 5, verse: 22 },
  { bookAbbr: '엡', chapter: 2, verse: 8 },
  { bookAbbr: '엡', chapter: 3, verse: 20 },
  { bookAbbr: '엡', chapter: 6, verse: 10 },
  { bookAbbr: '빌', chapter: 1, verse: 6 },
  { bookAbbr: '빌', chapter: 4, verse: 6 },
  { bookAbbr: '빌', chapter: 4, verse: 13 },
  { bookAbbr: '골', chapter: 3, verse: 23 },
  { bookAbbr: '살전', chapter: 5, verse: 16 },
  { bookAbbr: '딤후', chapter: 1, verse: 7 },
  { bookAbbr: '히', chapter: 11, verse: 1 },
  { bookAbbr: '히', chapter: 12, verse: 2 },
  { bookAbbr: '약', chapter: 1, verse: 2 },
  { bookAbbr: '약', chapter: 1, verse: 5 },
  { bookAbbr: '벧전', chapter: 5, verse: 7 },
  { bookAbbr: '요일', chapter: 4, verse: 18 },
  { bookAbbr: '계', chapter: 21, verse: 4 },
  { bookAbbr: '시', chapter: 1, verse: 1 },
  { bookAbbr: '시', chapter: 27, verse: 1 },
  { bookAbbr: '시', chapter: 37, verse: 4 },
  { bookAbbr: '시', chapter: 46, verse: 10 },
  { bookAbbr: '시', chapter: 55, verse: 22 },
  { bookAbbr: '시', chapter: 56, verse: 3 },
  { bookAbbr: '시', chapter: 62, verse: 1 },
  { bookAbbr: '시', chapter: 103, verse: 1 },
  { bookAbbr: '시', chapter: 118, verse: 24 },
  { bookAbbr: '시', chapter: 127, verse: 1 },
  { bookAbbr: '시', chapter: 150, verse: 6 },
  { bookAbbr: '잠', chapter: 4, verse: 23 },
  { bookAbbr: '잠', chapter: 18, verse: 10 },
  { bookAbbr: '사', chapter: 26, verse: 3 },
  { bookAbbr: '사', chapter: 40, verse: 29 },
  { bookAbbr: '사', chapter: 53, verse: 5 },
  { bookAbbr: '사', chapter: 55, verse: 8 },
  { bookAbbr: '눅', chapter: 1, verse: 37 },
  { bookAbbr: '요', chapter: 10, verse: 10 },
  { bookAbbr: '요', chapter: 16, verse: 33 },
  { bookAbbr: '행', chapter: 1, verse: 8 },
  { bookAbbr: '롬', chapter: 5, verse: 8 },
  { bookAbbr: '롬', chapter: 15, verse: 13 },
  { bookAbbr: '고전', chapter: 2, verse: 9 },
  { bookAbbr: '고전', chapter: 15, verse: 58 },
  { bookAbbr: '엡', chapter: 4, verse: 32 },
  { bookAbbr: '빌', chapter: 2, verse: 3 },
  { bookAbbr: '빌', chapter: 3, verse: 14 },
  { bookAbbr: '골', chapter: 3, verse: 2 },
  { bookAbbr: '히', chapter: 4, verse: 16 },
  { bookAbbr: '히', chapter: 13, verse: 8 },
  { bookAbbr: '약', chapter: 4, verse: 8 },
  { bookAbbr: '벧전', chapter: 2, verse: 9 },
  { bookAbbr: '요일', chapter: 1, verse: 9 },
  { bookAbbr: '계', chapter: 3, verse: 20 },
  // Fill rest of year with cycling
];

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const idx = dayOfYear % CURATED_VERSES.length;

    const entry = CURATED_VERSES[idx];
    const book = await BibleBook.findOne({ abbrKo: entry.bookAbbr });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const chapterData = book.chapters[entry.chapter - 1];
    const text = chapterData && chapterData[entry.verse - 1] ? chapterData[entry.verse - 1] : '';

    res.json({
      success: true,
      data: {
        bookAbbr: entry.bookAbbr,
        bookName: book.nameKo,
        chapter: entry.chapter,
        verse: entry.verse,
        text,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
