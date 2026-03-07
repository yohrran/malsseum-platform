const mongoose = require('mongoose');
const PointsLedger = require('../models/PointsLedger');
const User = require('../models/User');

// C-2: MongoDB 트랜잭션으로 포인트 적립 원자성 보장
const addPoints = async (userId, eventType, points, referenceId, description) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await PointsLedger.create(
      [{ userId, eventType, points, referenceId, description }],
      { session }
    );

    await User.findByIdAndUpdate(
      userId,
      { $inc: { totalPoints: points } },
      { session }
    );

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
    console.error('checkStreak failed (non-blocking):', err.message);
  }
};

const checkStreak = async (userId) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // M-3: 최근 31일로 쿼리 제한
  const thirtyOneDaysAgo = new Date(today);
  thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

  const recentEntries = await PointsLedger.find({
    userId,
    eventType: { $in: ['custom_day_complete', 'daily_complete'] },
    createdAt: { $gte: thirtyOneDaysAgo, $lte: now },
  }).sort({ createdAt: -1 });

  const uniqueDays = new Set();
  for (const entry of recentEntries) {
    const d = entry.createdAt;
    uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  // M-3: 최대 반복 횟수 제한
  let streak = 0;
  const checkDate = new Date(today);
  while (streak <= 365) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (uniqueDays.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const todayStr = today.toISOString().slice(0, 10);

  if (streak >= 30) {
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
          [{ userId, eventType: 'streak_30', points: 500, description: `30-day streak on ${todayStr}` }],
          { session }
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
  } else if (streak >= 7) {
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
          [{ userId, eventType: 'streak_7', points: 100, description: `7-day streak on ${todayStr}` }],
          { session }
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
};

module.exports = { addPoints, checkStreak };
