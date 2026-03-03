const BibleCache = require('../models/BibleCache');

const getWithCache = async (cacheKey, fetchFn, ttlDays) => {
  const cached = await BibleCache.findOne({ cacheKey });
  if (cached) {
    return cached.data;
  }

  const data = await fetchFn();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  await BibleCache.findOneAndUpdate(
    { cacheKey },
    { cacheKey, data, cachedAt: new Date(), expiresAt },
    { upsert: true, new: true }
  );

  return data;
};

module.exports = { getWithCache };
