import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';

import { rateLimit } from './middleware/rateLimit.js';
import { runMigrations } from './db/migrate.js';
import authRouter from './routes/auth.js';
import cohortsRouter from './routes/cohorts.js';
import reviewsRouter from './routes/reviews.js';
import githubRouter from './routes/github.js';
import analyzeRouter from './routes/analyze.js';
import emailRouter from './routes/email.js';

const app = express();

// ── Security headers (no external packages needed) ────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimit    = rateLimit({ max: 10, windowMs: 60_000, message: 'Too many login attempts, please wait a minute.' });
const defaultLimit = rateLimit({ max: 60, windowMs: 60_000, message: 'Too many requests, please slow down.' });
const aiLimit      = rateLimit({ max: 20, windowMs: 60_000, message: 'AI analysis rate limit reached, please wait.' });
const emailLimit   = rateLimit({ max:  5, windowMs: 60_000, message: 'Email rate limit reached, please wait.' });

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.use('/api', authLimit,    authRouter);
app.use('/api', defaultLimit, cohortsRouter);
app.use('/api', defaultLimit, reviewsRouter);
app.use('/api', defaultLimit, githubRouter);
app.use('/api', aiLimit,      analyzeRouter);
app.use('/api', emailLimit,   emailRouter);

// ── Centralized error handler ─────────────────────────────────────────────────
app.use((err: Error & { status?: number; details?: unknown }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server error]', err.message);
  const status = err.status ?? 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(err.details !== undefined && { details: err.details }),
  });
});

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  if (process.env.DATABASE_URL) {
    try {
      await runMigrations();
    } catch (err) {
      console.warn('[startup] DB migration failed (continuing without DB):', (err as Error).message);
    }
  } else {
    console.warn('[startup] DATABASE_URL not set — auth/cohort features will return 503');
  }

  const PORT = process.env.PORT ?? 3001;
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[startup fatal]', err);
  process.exit(1);
});
