const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema({
  dayNumber: Number,
  scheduledDate: Date,
  chapterRefs: [String],
  isCompleted: { type: Boolean, default: false },
  completedAt: Date
});

const readingPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planType: { type: String, enum: ['yearly', 'custom'], default: 'yearly' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  chaptersPerDay: Number,
  isActive: { type: Boolean, default: true },
  days: [dayPlanSchema],
  createdAt: { type: Date, default: Date.now }
});

// M-1: userId + isActive 복합 조건으로 자주 조회
readingPlanSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('ReadingPlan', readingPlanSchema);
