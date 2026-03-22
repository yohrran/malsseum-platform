import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ReadingPlan, { IDayPlan } from '../models/ReadingPlan';
import CustomPlan from '../models/CustomPlan';
import User from '../models/User';
import { authenticate } from '../middleware/auth';
import { calculateReadingPlan } from '../services/reading-plan-calculator';
import { addPoints } from '../services/points-service';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await ReadingPlan.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, planType } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'startDate and endDate are required' });
    }

    // M-6: 날짜 유효성 검증
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date format' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, error: 'endDate must be after startDate' });
    }

    await ReadingPlan.updateMany({ userId: req.user!._id, isActive: true }, { isActive: false });

    const { days, chaptersPerDay } = calculateReadingPlan(start, end);
    const plan = await ReadingPlan.create({
      userId: req.user!._id,
      planType: planType || 'yearly',
      startDate: start,
      endDate: end,
      chaptersPerDay,
      days,
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

router.get('/today', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await ReadingPlan.findOne({ userId: req.user!._id, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'No active reading plan' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayPlan = plan.days.find((d) => {
      if (!d.scheduledDate) return false;
      const scheduled = new Date(d.scheduledDate);
      const scheduledDay = new Date(
        scheduled.getFullYear(),
        scheduled.getMonth(),
        scheduled.getDate(),
      );
      return scheduledDay.getTime() === today.getTime();
    });

    res.json({ success: true, data: todayPlan || null });
  } catch (err) {
    next(err);
  }
});

router.patch('/:planId/days/:dayId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = req.params.planId as string;
    const dayId = req.params.dayId as string;
    const { isCompleted } = req.body;

    // H-1: ObjectId 형식 검증
    if (!mongoose.Types.ObjectId.isValid(planId) || !mongoose.Types.ObjectId.isValid(dayId)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    const plan = await ReadingPlan.findOne({ _id: planId, userId: req.user!._id });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const day = plan.days.find((d: IDayPlan & { _id?: mongoose.Types.ObjectId }) =>
      d._id?.toString() === dayId,
    );
    if (!day) {
      return res.status(404).json({ success: false, error: 'Day not found' });
    }

    const wasCompleted = day.isCompleted;
    day.isCompleted = isCompleted;
    day.completedAt = isCompleted ? new Date() : undefined;
    await plan.save();

    if (isCompleted && !wasCompleted) {
      await addPoints(
        req.user!._id,
        'daily_complete',
        50,
        plan._id,
        `Day ${day.dayNumber} completed`,
      );
    }

    res.json({ success: true, data: day });
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await ReadingPlan.find({ userId: req.user!._id });

    const completedDays: { date: string; chapters: number }[] = [];
    for (const plan of plans) {
      for (const day of plan.days) {
        if (day.isCompleted && day.completedAt) {
          completedDays.push({
            date: new Date(day.completedAt).toISOString().slice(0, 10),
            chapters: day.chapterRefs.length,
          });
        }
      }
    }

    const weeklyMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};
    for (const entry of completedDays) {
      const d = new Date(entry.date);
      const weekKey = getWeekKey(d);
      const monthKey = entry.date.slice(0, 7);

      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + entry.chapters;
      monthlyMap[entry.date] = (monthlyMap[entry.date] || 0) + entry.chapters;
    }

    const weekly = Object.entries(weeklyMap)
      .map(([week, chapters]) => ({ week, chapters }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12);

    const totalChapters = completedDays.reduce((sum, d) => sum + d.chapters, 0);
    const totalDaysCompleted = new Set(completedDays.map((d) => d.date)).size;

    res.json({
      success: true,
      data: {
        weekly,
        monthly: monthlyMap,
        totalChapters,
        totalDaysCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/yearly-report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const [plans, customPlans, user] = await Promise.all([
      ReadingPlan.find({ userId: req.user!._id }),
      CustomPlan.find({ userId: req.user!._id }),
      User.findById(req.user!._id).select('totalPoints currentStreak longestStreak createdAt'),
    ]);

    const monthlyChapters: Record<number, number> = {};
    const bookCounts: Record<string, number> = {};
    let totalChapters = 0;
    let totalDays = 0;
    const completedDates = new Set<string>();

    for (const plan of plans) {
      for (const day of plan.days) {
        if (!day.isCompleted || !day.completedAt) continue;
        const d = new Date(day.completedAt);
        if (d < yearStart || d > yearEnd) continue;

        const dateStr = d.toISOString().slice(0, 10);
        const monthKey = d.getMonth();
        const chapters = day.chapterRefs.length;

        monthlyChapters[monthKey] = (monthlyChapters[monthKey] || 0) + chapters;
        totalChapters += chapters;
        completedDates.add(dateStr);

        for (const ref of day.chapterRefs) {
          const bookName = ref.split(' ')[0];
          bookCounts[bookName] = (bookCounts[bookName] || 0) + 1;
        }
      }
    }

    for (const plan of customPlans) {
      for (const season of plan.seasons) {
        for (const day of season.days) {
          if (!day.isCompleted || !day.completedAt) continue;
          const d = new Date(day.completedAt);
          if (d < yearStart || d > yearEnd) continue;

          const dateStr = d.toISOString().slice(0, 10);
          const monthKey = d.getMonth();
          const chapters = day.chapters.length;

          monthlyChapters[monthKey] = (monthlyChapters[monthKey] || 0) + chapters;
          totalChapters += chapters;
          completedDates.add(dateStr);

          if (day.bookAbbr) {
            bookCounts[day.bookAbbr] = (bookCounts[day.bookAbbr] || 0) + chapters;
          }
        }
      }
    }

    totalDays = completedDates.size;

    const topBooks = Object.entries(bookCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([book, count]) => ({ book, count }));

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      chapters: monthlyChapters[i] || 0,
    }));

    res.json({
      success: true,
      data: {
        year,
        totalChapters,
        totalDays,
        totalPoints: user?.totalPoints ?? 0,
        longestStreak: user?.longestStreak ?? 0,
        monthly,
        topBooks,
      },
    });
  } catch (err) {
    next(err);
  }
});

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export default router;
