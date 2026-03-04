const express = require('express');
const PointsLedger = require('../models/PointsLedger');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/balance', async (req, res, next) => {
  try {
    res.json({ success: true, data: { balance: req.user.totalPoints } });
  } catch (err) {
    next(err);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const history = await PointsLedger.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    const leaderboard = await User.find()
      .sort({ totalPoints: -1 })
      .limit(20)
      .select('displayName picture totalPoints');
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
