import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = Router();

// OAuth2Client를 재사용 (요청마다 생성 방지)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SAFE_USER_FIELDS =
  '_id email displayName picture preferredLanguage totalPoints currentStreak longestStreak lastReadDate';

router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Credential is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload!;

    const user = await User.findOneAndUpdate(
      { googleId },
      { googleId, email, displayName: name, picture },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).select(SAFE_USER_FIELDS);

    const token = jwt.sign(
      { userId: String(user!._id) },
      process.env.JWT_SECRET as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' } as any,
    );

    res.json({ success: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
});

router.patch('/profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { preferredLanguage } = req.body;
    const update: Record<string, unknown> = {};

    if (preferredLanguage !== undefined) {
      if (!['ko', 'en'].includes(preferredLanguage)) {
        return res
          .status(400)
          .json({ success: false, error: 'preferredLanguage must be ko or en' });
      }
      update.preferredLanguage = preferredLanguage;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.user!._id, update, { new: true }).select(
      SAFE_USER_FIELDS,
    );

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// M-7: googleId, __v 등 민감/불필요 필드 제외
router.get('/me', authenticate, (req: Request, res: Response) => {
  const {
    _id,
    email,
    displayName,
    picture,
    preferredLanguage,
    totalPoints,
    currentStreak,
    longestStreak,
    lastReadDate,
  } = req.user!;
  res.json({
    success: true,
    data: {
      _id,
      email,
      displayName,
      picture,
      preferredLanguage,
      totalPoints,
      currentStreak,
      longestStreak,
      lastReadDate,
    },
  });
});

router.get('/streak', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id).select(
      'currentStreak longestStreak lastReadDate graceDaysRemaining graceDaysUsedDates',
    );
    res.json({
      success: true,
      data: {
        currentStreak: user?.currentStreak ?? 0,
        longestStreak: user?.longestStreak ?? 0,
        lastReadDate: user?.lastReadDate ?? null,
        graceDaysRemaining: user?.graceDaysRemaining ?? 2,
        graceDaysUsedDates: user?.graceDaysUsedDates ?? [],
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id).select(SAFE_USER_FIELDS);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const token = jwt.sign(
      { userId: String(user._id) },
      process.env.JWT_SECRET as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' } as any,
    );

    res.json({ success: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
});

export default router;
