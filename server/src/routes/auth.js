const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// OAuth2Client를 재사용 (요청마다 생성 방지)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SAFE_USER_FIELDS = '_id email displayName picture preferredBibleId preferredLanguage totalPoints';

router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Credential is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const user = await User.findOneAndUpdate(
      { googleId },
      { googleId, email, displayName: name, picture },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select(SAFE_USER_FIELDS);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ success: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
});

// M-7: googleId, __v 등 민감/불필요 필드 제외
router.get('/me', authenticate, (req, res) => {
  const { _id, email, displayName, picture, preferredBibleId, preferredLanguage, totalPoints } = req.user;
  res.json({
    success: true,
    data: { _id, email, displayName, picture, preferredBibleId, preferredLanguage, totalPoints },
  });
});

module.exports = router;
