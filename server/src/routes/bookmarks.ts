import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Bookmark from '../models/Bookmark';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET all
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
});

// GET all tags
router.get('/tags/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await Bookmark.distinct('tags', { userId: req.user!._id });
    res.json({ success: true, data: tags.sort() });
  } catch (err) {
    next(err);
  }
});

// GET by tag
router.get('/tags/:tag', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = req.params.tag as string;
    const bookmarks = await Bookmark.find({ userId: req.user!._id, tags: tag.toLowerCase() }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
});

// GET by chapter
router.get('/:bookId/:chapter', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId, chapter } = req.params;
    const bookmarks = await Bookmark.find({
      userId: req.user!._id,
      bookId,
      chapter: Number(chapter),
    });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
});

// POST toggle
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId, chapter, verse, note } = req.body;
    if (!bookId || !chapter || !verse)
      return res
        .status(400)
        .json({ success: false, error: 'bookId, chapter, and verse are required' });
    const existing = await Bookmark.findOne({ userId: req.user!._id, bookId, chapter, verse });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.json({ success: true, data: null, message: 'Bookmark removed' });
    }
    const bookmark = await Bookmark.create({
      userId: req.user!._id,
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

// PATCH note/tags
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { note, tags } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    const update: Record<string, unknown> = {};
    if (typeof note === 'string') update.note = note;
    if (Array.isArray(tags)) {
      update.tags = tags
        .filter((t: unknown) => typeof t === 'string')
        .map((t: string) => t.trim().toLowerCase())
        .filter((t: string) => t.length > 0)
        .slice(0, 10);
    }
    if (Object.keys(update).length === 0)
      return res.status(400).json({ success: false, error: 'note or tags required' });
    const bookmark = await Bookmark.findOneAndUpdate({ _id: id, userId: req.user!._id }, update, {
      new: true,
    });
    if (!bookmark) return res.status(404).json({ success: false, error: 'Bookmark not found' });
    res.json({ success: true, data: bookmark });
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    await Bookmark.deleteOne({ _id: id, userId: req.user!._id });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
