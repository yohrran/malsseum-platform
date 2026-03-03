const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  date: String,
  bookAbbr: String,
  chapters: [Number],
  isCompleted: { type: Boolean, default: false },
  completedAt: Date
}, { _id: false });

const seasonSchema = new mongoose.Schema({
  seasonNumber: Number,
  name: String,
  startDate: Date,
  endDate: Date,
  label: String,
  days: [daySchema],
  isCompleted: { type: Boolean, default: false },
  completedAt: Date
});

const customPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  seasons: [seasonSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

customPlanSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// M-1: userId 기준 목록 조회 최적화
customPlanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CustomPlan', customPlanSchema);
