const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  picture: { type: String },
  preferredLanguage: { type: String, default: 'ko' },
  totalPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// M-1: 리더보드 쿼리 최적화
userSchema.index({ totalPoints: -1 });

module.exports = mongoose.model('User', userSchema);
