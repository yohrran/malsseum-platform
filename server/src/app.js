const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/error-handler');

const authRoutes = require('./routes/auth');
const customPlanRoutes = require('./routes/custom-plan');
const readingRoutes = require('./routes/reading');
const pointsRoutes = require('./routes/points');
const bibleRoutes = require('./routes/bible');

const app = express();

// M-5: CLIENT_URL 미설정 시 경고 (프로덕션 환경에서만 강제)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8000';

app.use(helmet());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// H-5: body 크기 제한
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// M-8: Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 20,
  message: { success: false, error: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/custom-plans', customPlanRoutes);
app.use('/api/reading-plans', readingRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/bible', bibleRoutes);

app.use(errorHandler);

module.exports = app;
