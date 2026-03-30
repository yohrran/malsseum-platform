import { Router, Request, Response, NextFunction } from 'express';
import Highlight from '../models/Highlight';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const VALID_COLORS = ['yellow', 'green', 'blue', 'pink', 'purple'];

router.get('/:bookId/:chapter', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId, chapter } = req.params;
    const highlights = await Highlight.find({
      userId: req.user!._id,
      bookId,
      chapter: Number(chapter),
    });
    res.json({ success: true, data: highlights });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId, chapter, verse, color } = req.body;
    if (!bookId || !chapter || !verse || !color)
      return res
        .status(400)
        .json({ success: false, error: 'bookId, chapter, verse, and color are required' });
    if (!VALID_COLORS.includes(color))
      return res
        .status(400)
        .json({ success: false, error: `color must be one of: ${VALID_COLORS.join(', ')}` });
    const highlight = await Highlight.findOneAndUpdate(
      { userId: req.user!._id, bookId, chapter, verse },
      { color },
      { upsert: true, new: true },
    );
    res.json({ success: true, data: highlight });
  } catch (err) {
    next(err);
  }
});

router.delete(
  '/:bookId/:chapter/:verse',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookId, chapter, verse } = req.params;
      await Highlight.deleteOne({
        userId: req.user!._id,
        bookId,
        chapter: Number(chapter),
        verse: Number(verse),
      });
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
