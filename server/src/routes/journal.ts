import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Journal from '../models/Journal';
import { authenticate } from '../middleware/auth';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const router = Router();
router.use(authenticate);

// GET all (paginated)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const [journals, total] = await Promise.all([
      Journal.find({ userId: req.user!._id }).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Journal.countDocuments({ userId: req.user!._id }),
    ]);
    res.json({ success: true, data: journals, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// GET by date
router.get('/date/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = req.params.date as string;
    if (!DATE_REGEX.test(date)) return res.status(400).json({ success: false, error: 'Invalid date format' });
    const journal = await Journal.findOne({ userId: req.user!._id, date }).lean();
    res.json({ success: true, data: journal });
  } catch (err) {
    next(err);
  }
});

// POST create/update
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, content, linkedVerses } = req.body;
    if (!date || !content) return res.status(400).json({ success: false, error: 'date and content are required' });
    if (!DATE_REGEX.test(date)) return res.status(400).json({ success: false, error: 'Invalid date format' });
    if (content.length > 5000) return res.status(400).json({ success: false, error: 'content must be 5000 characters or less' });
    const validVerses = Array.isArray(linkedVerses)
      ? linkedVerses.filter((v: any) => v.bookAbbr && v.bookName && v.chapter && v.verse).slice(0, 10)
      : [];
    const journal = await Journal.findOneAndUpdate(
      { userId: req.user!._id, date },
      { content, linkedVerses: validVerses },
      { upsert: true, new: true },
    );
    res.json({ success: true, data: journal });
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, error: 'Invalid ID' });
    await Journal.deleteOne({ _id: id, userId: req.user!._id });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
