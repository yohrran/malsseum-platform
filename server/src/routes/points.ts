import { Router, Request, Response, NextFunction } from 'express';
import PointsLedger from '../models/PointsLedger';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/balance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: { balance: req.user!.totalPoints } });
  } catch (err) {
    next(err);
  }
});

router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await PointsLedger.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await User.find().sort({ totalPoints: -1 }).limit(20).select('displayName picture totalPoints');
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
});

export default router;
