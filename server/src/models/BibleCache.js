const mongoose = require('mongoose');

const bibleCacheSchema = new mongoose.Schema({
  cacheKey: { type: String, unique: true, required: true },
  data: mongoose.Schema.Types.Mixed,
  cachedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

bibleCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('BibleCache', bibleCacheSchema);
