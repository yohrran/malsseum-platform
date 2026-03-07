const express = require('express');
const mongoose = require('mongoose');
const CustomPlan = require('../models/CustomPlan');
const { authenticate } = require('../middleware/auth');
const { addPoints } = require('../services/points-service');

const router = express.Router();

router.use(authenticate);

// H-1: ObjectId 검증 헬퍼
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// H-2: 배열 인덱스 검증 헬퍼
const parseIndex = (value) => {
  const index = parseInt(value, 10);
  return Number.isInteger(index) && index >= 0 ? index : null;
};

router.get('/', async (req, res, next) => {
  try {
    const plans = await CustomPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, seasons } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    const plan = await CustomPlan.create({
      userId: req.user._id,
      title,
      seasons: seasons || [],
    });
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid plan ID' });
    }
    const plan = await CustomPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid plan ID' });
    }
    const { title, seasons } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    if (seasons !== undefined && !Array.isArray(seasons)) {
      return res.status(400).json({ success: false, error: 'Seasons must be an array' });
    }
    const plan = await CustomPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title: title.trim(), seasons, updatedAt: new Date() },
      { new: true }
    );
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid plan ID' });
    }
    const plan = await CustomPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    res.json({ success: true, data: { message: 'Plan deleted' } });
  } catch (err) {
    next(err);
  }
});

// 날짜별 완료 체크
router.patch('/:planId/seasons/:seasonIdx/days/:dayIdx', async (req, res, next) => {
  try {
    const { planId, seasonIdx, dayIdx } = req.params;
    const { isCompleted } = req.body;

    // H-1: ObjectId 검증
    if (!isValidObjectId(planId)) {
      return res.status(400).json({ success: false, error: 'Invalid plan ID' });
    }

    // H-2: 배열 인덱스 검증
    const seasonIndex = parseIndex(seasonIdx);
    const dayIndex = parseIndex(dayIdx);
    if (seasonIndex === null) {
      return res.status(400).json({ success: false, error: 'Invalid season index' });
    }
    if (dayIndex === null) {
      return res.status(400).json({ success: false, error: 'Invalid day index' });
    }

    const plan = await CustomPlan.findOne({ _id: planId, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const season = plan.seasons[seasonIndex];
    if (!season) {
      return res.status(404).json({ success: false, error: 'Season not found' });
    }

    const day = season.days[dayIndex];
    if (!day) {
      return res.status(404).json({ success: false, error: 'Day not found' });
    }

    // H-3: 이미 완료된 날짜 재완료 시 포인트 중복 방지
    if (day.isCompleted && isCompleted) {
      return res.json({ success: true, data: plan });
    }

    day.isCompleted = isCompleted;
    day.completedAt = isCompleted ? new Date() : null;
    await plan.save();

    if (isCompleted) {
      await addPoints(req.user._id, 'custom_day_complete', 30, plan._id, `${season.name} - ${day.date} completed`);
    }

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

// 시즌 완주 처리
router.patch('/:planId/seasons/:seasonIdx/complete', async (req, res, next) => {
  try {
    const { planId, seasonIdx } = req.params;

    if (!isValidObjectId(planId)) {
      return res.status(400).json({ success: false, error: 'Invalid plan ID' });
    }

    const seasonIndex = parseIndex(seasonIdx);
    if (seasonIndex === null) {
      return res.status(400).json({ success: false, error: 'Invalid season index' });
    }

    const plan = await CustomPlan.findOne({ _id: planId, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const season = plan.seasons[seasonIndex];
    if (!season) {
      return res.status(404).json({ success: false, error: 'Season not found' });
    }

    // H-3: 이미 완주한 시즌 중복 방지
    if (season.isCompleted) {
      return res.status(400).json({ success: false, error: 'Season already completed' });
    }

    // H-4: 모든 날짜 완료 여부 검증
    const allDaysCompleted = season.days.length > 0 && season.days.every(d => d.isCompleted);
    if (!allDaysCompleted) {
      return res.status(400).json({
        success: false,
        error: 'All days must be completed before completing the season',
      });
    }

    season.isCompleted = true;
    season.completedAt = new Date();
    await plan.save();

    await addPoints(req.user._id, 'season_complete', 200, plan._id, `${season.name} completed`);

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
