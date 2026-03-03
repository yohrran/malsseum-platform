const express = require('express');
const mongoose = require('mongoose');
const ReadingPlan = require('../models/ReadingPlan');
const { authenticate } = require('../middleware/auth');
const { calculateReadingPlan } = require('../services/reading-plan-calculator');
const { addPoints } = require('../services/points-service');

const router = express.Router();

router.use(authenticate);

router.post('/', async (req, res, next) => {
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

    await ReadingPlan.updateMany(
      { userId: req.user._id, isActive: true },
      { isActive: false }
    );

    const { days, chaptersPerDay } = calculateReadingPlan(start, end);
    const plan = await ReadingPlan.create({
      userId: req.user._id,
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

router.get('/today', async (req, res, next) => {
  try {
    const plan = await ReadingPlan.findOne({ userId: req.user._id, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'No active reading plan' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayPlan = plan.days.find(d => {
      const scheduled = new Date(d.scheduledDate);
      const scheduledDay = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate());
      return scheduledDay.getTime() === today.getTime();
    });

    res.json({ success: true, data: todayPlan || null });
  } catch (err) {
    next(err);
  }
});

router.patch('/:planId/days/:dayId', async (req, res, next) => {
  try {
    const { planId, dayId } = req.params;
    const { isCompleted } = req.body;

    // H-1: ObjectId 형식 검증
    if (!mongoose.Types.ObjectId.isValid(planId) || !mongoose.Types.ObjectId.isValid(dayId)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    const plan = await ReadingPlan.findOne({ _id: planId, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const day = plan.days.id(dayId);
    if (!day) {
      return res.status(404).json({ success: false, error: 'Day not found' });
    }

    const wasCompleted = day.isCompleted;
    day.isCompleted = isCompleted;
    day.completedAt = isCompleted ? new Date() : null;
    await plan.save();

    if (isCompleted && !wasCompleted) {
      await addPoints(req.user._id, 'daily_complete', 50, plan._id, `Day ${day.dayNumber} completed`);
    }

    res.json({ success: true, data: day });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
