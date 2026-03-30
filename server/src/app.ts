import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error-handler';

import authRoutes from './routes/auth';
import customPlanRoutes from './routes/custom-plan';
import readingRoutes from './routes/reading';
import pointsRoutes from './routes/points';
import bibleRoutes from './routes/bible';
import bookmarkRoutes from './routes/bookmarks';
import highlightRoutes from './routes/highlights';
import dailyVerseRoutes from './routes/daily-verse';
import journalRoutes from './routes/journal';

const app = express();

// M-5: CLIENT_URL 미설정 시 경고 (프로덕션 환경에서만 강제)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8000';

app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

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
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/daily-verse', dailyVerseRoutes);
app.use('/api/journals', journalRoutes);

app.use(errorHandler);

export default app;
