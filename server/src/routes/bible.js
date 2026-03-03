const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const { getWithCache } = require('../services/bible-cache-service');

const router = express.Router();

const BIBLE_API_BASE = 'https://api.scripture.api.bible/v1';

// M-4: 입력 패턴 검증 (SSRF 방지)
const BIBLE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const REF_PATTERN = /^[a-zA-Z0-9.:,-]+$/;
const LANGUAGE_PATTERN = /^[a-z]{2,3}(-[A-Z]{2})?$/;

const getBibleApiClient = () =>
  axios.create({
    baseURL: BIBLE_API_BASE,
    headers: { 'api-key': process.env.BIBLE_API_KEY },
    timeout: 10000,
  });

router.use(authenticate);

router.get('/bibles', async (req, res, next) => {
  try {
    const { language } = req.query;

    if (language && !LANGUAGE_PATTERN.test(language)) {
      return res.status(400).json({ success: false, error: 'Invalid language format' });
    }

    const cacheKey = `bibles:${language || 'all'}`;
    const data = await getWithCache(cacheKey, async () => {
      const params = language ? { language } : {};
      const response = await getBibleApiClient().get('/bibles', { params });
      return response.data.data;
    }, 30);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/books/:bibleId', async (req, res, next) => {
  try {
    const { bibleId } = req.params;

    if (!BIBLE_ID_PATTERN.test(bibleId)) {
      return res.status(400).json({ success: false, error: 'Invalid bible ID format' });
    }

    const cacheKey = `books:${bibleId}`;
    const data = await getWithCache(cacheKey, async () => {
      const response = await getBibleApiClient().get(`/bibles/${bibleId}/books`);
      return response.data.data;
    }, 30);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/passage/:bibleId/:ref', async (req, res, next) => {
  try {
    const { bibleId, ref } = req.params;

    if (!BIBLE_ID_PATTERN.test(bibleId)) {
      return res.status(400).json({ success: false, error: 'Invalid bible ID format' });
    }
    if (!REF_PATTERN.test(ref)) {
      return res.status(400).json({ success: false, error: 'Invalid reference format' });
    }

    const cacheKey = `passage:${bibleId}:${ref}`;
    const data = await getWithCache(cacheKey, async () => {
      const response = await getBibleApiClient().get(`/bibles/${bibleId}/passages/${ref}`, {
        params: {
          'content-type': 'html',
          'include-notes': false,
          'include-titles': true,
          'include-chapter-numbers': true,
          'include-verse-numbers': true,
        },
      });
      return response.data.data;
    }, 365);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
