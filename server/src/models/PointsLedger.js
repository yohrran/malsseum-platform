const mongoose = require('mongoose');

const pointsLedgerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: {
    type: String,
    enum: ['chapter_complete', 'daily_complete', 'custom_day_complete', 'season_complete', 'streak_7', 'streak_30'],
    required: true
  },
  points: { type: Number, required: true },
  referenceId: mongoose.Schema.Types.ObjectId,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

pointsLedgerSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PointsLedger', pointsLedgerSchema);
