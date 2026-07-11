import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { runMigrations } from './db/migrate.js';
import authRouter from './routes/auth.js';
import cohortsRouter from './routes/cohorts.js';
import reviewsRouter from './routes/reviews.js';
import githubRouter from './routes/github.js';
import analyzeRouter from './routes/analyze.js';
import emailRouter from './routes/email.js';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // handled by Vite in dev; set on CDN in prod
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser clients (curl, Postman) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const defaultLimiter = rateLimit({
  windowMs: 60_000,        // 1 minute
  max: 60,                 // 60 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,                 // 10 auth attempts/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please wait a minute.' },
});

const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,                 // 20 AI calls/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI analysis rate limit reached, please wait.' },
});

const emailLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,                  // 5 emails/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Email rate limit reached, please wait.' },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.use('/api', authLimiter, authRouter);
app.use('/api', defaultLimiter, cohortsRouter);
app.use('/api', defaultLimiter, reviewsRouter);
app.use('/api', defaultLimiter, githubRouter);
app.use('/api', aiLimiter, analyzeRouter);
app.use('/api', emailLimiter, emailRouter);

// ── Centralized error handler ─────────────────────────────────────────────────
app.use((err: Error & { status?: number; details?: unknown }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server error]', err);
  const status = err.status ?? 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(err.details !== undefined && { details: err.details }),
  });
});

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  if (process.env.DATABASE_URL) {
    await runMigrations();
  } else {
    console.warn('[db] DATABASE_URL not set — database features disabled');
  }

  const PORT = process.env.PORT ?? 3001;
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[startup]', err);
  process.exit(1);
});
