import mongoose from 'mongoose';
import PointsLedger, { PointsEventType } from '../models/PointsLedger';
import User from '../models/User';

export const addPoints = async (
  userId: mongoose.Types.ObjectId,
  eventType: PointsEventType,
  points: number,
  referenceId?: mongoose.Types.ObjectId,
  description?: string,
): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await PointsLedger.create([{ userId, eventType, points, referenceId, description }], {
      session,
    });
    await User.findByIdAndUpdate(userId, { $inc: { totalPoints: points } }, { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
  try {
    await checkStreak(userId);
  } catch (err) {
    console.error('checkStreak failed (non-blocking):', (err as Error).message);
  }
};

const resetGraceDaysIfNeeded = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  const user = await User.findById(userId).select('graceDayResetDate graceDaysRemaining');
  if (!user) return;
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (!user.graceDayResetDate || user.graceDayResetDate < thisMonth) {
    await User.findByIdAndUpdate(userId, {
      graceDaysRemaining: 2,
      graceDaysUsedDates: [],
      graceDayResetDate: thisMonth,
    });
  }
};

export const checkStreak = async (userId: mongoose.Types.ObjectId): Promise<number> => {
  await resetGraceDaysIfNeeded(userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyOneDaysAgo = new Date(today);
  thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

  const recentEntries = await PointsLedger.find({
    userId,
    eventType: { $in: ['custom_day_complete', 'daily_complete'] },
    createdAt: { $gte: thirtyOneDaysAgo, $lte: now },
  }).sort({ createdAt: -1 });

  const uniqueDays = new Set<string>();
  for (const entry of recentEntries) {
    const d = entry.createdAt;
    uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  const user = await User.findById(userId).select(
    'currentStreak longestStreak graceDaysRemaining graceDaysUsedDates',
  );
  if (!user) return 0;

  let streak = 0;
  let graceDaysUsedNow = 0;
  const newGraceDates: Date[] = [];
  const checkDate = new Date(today);

  while (streak + graceDaysUsedNow <= 365) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (uniqueDays.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (graceDaysUsedNow < (user.graceDaysRemaining ?? 0) && streak > 0) {
      graceDaysUsedNow++;
      newGraceDates.push(new Date(checkDate));
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const totalStreak = streak + graceDaysUsedNow;
  const todayStr = today.toISOString().slice(0, 10);
  const updateFields: Record<string, unknown> = {
    currentStreak: totalStreak,
    longestStreak: Math.max(totalStreak, user.longestStreak ?? 0),
    lastReadDate: totalStreak > 0 ? today : user.lastReadDate,
  };

  if (graceDaysUsedNow > 0) {
    updateFields.graceDaysRemaining = (user.graceDaysRemaining ?? 2) - graceDaysUsedNow;
    updateFields.graceDaysUsedDates = [...(user.graceDaysUsedDates ?? []), ...newGraceDates];
  }

  await User.findByIdAndUpdate(userId, updateFields);

  if (totalStreak >= 30) {
    const existing = await PointsLedger.findOne({
      userId,
      eventType: 'streak_30',
      createdAt: { $gte: today },
    });
    if (!existing) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        await PointsLedger.create(
          [
            {
              userId,
              eventType: 'streak_30',
              points: 500,
              description: `30-day streak on ${todayStr}`,
            },
          ],
          { session },
        );
        await User.findByIdAndUpdate(userId, { $inc: { totalPoints: 500 } }, { session });
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }
  } else if (totalStreak >= 7) {
    const existing = await PointsLedger.findOne({
      userId,
      eventType: 'streak_7',
      createdAt: { $gte: today },
    });
    if (!existing) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        await PointsLedger.create(
          [
            {
              userId,
              eventType: 'streak_7',
              points: 100,
              description: `7-day streak on ${todayStr}`,
            },
          ],
          { session },
        );
        await User.findByIdAndUpdate(userId, { $inc: { totalPoints: 100 } }, { session });
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }
  }

  return totalStreak;
};
