import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';

import { rateLimit } from './middleware/rateLimit.js';
import { runMigrations } from './db/migrate.js';
import { getSql, closeSql } from './db/connection.js';
import { getRedis, closeRedis } from './redis/client.js';
import authRouter from './routes/auth.js';
import cohortsRouter from './routes/cohorts.js';
import reviewsRouter from './routes/reviews.js';
import rubricsRouter from './routes/rubrics.js';
import githubRouter from './routes/github.js';
import analyzeRouter from './routes/analyze.js';
import emailRouter from './routes/email.js';
import guideRouter from './routes/guide.js';

const app = express();

// ── Security headers (no external packages needed) ────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
  .split(',').map((o) => o.trim()).filter(Boolean);
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
const authLimit    = rateLimit({ max: 30,  windowMs: 60_000, message: 'Too many login attempts, please wait a minute.' });
const defaultLimit = rateLimit({ max: 200, windowMs: 60_000, message: 'Too many requests, please slow down.' });
const aiLimit      = rateLimit({ max: 60,  windowMs: 60_000, message: 'AI analysis rate limit reached, please wait.' });
const emailLimit   = rateLimit({ max: 20,  windowMs: 60_000, message: 'Email rate limit reached, please wait.' });

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  try {
    if (process.env.DATABASE_URL) {
      const sql = await getSql();
      await sql`SELECT 1`;
      checks.db = 'ok';
    } else {
      checks.db = 'unconfigured';
    }
  } catch {
    checks.db = 'error';
  }

  try {
    const redis = await getRedis();
    if (redis) {
      await redis.ping();
      checks.redis = 'ok';
    } else {
      checks.redis = 'unconfigured';
    }
  } catch {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok' || v === 'unconfigured');
  res.status(allOk ? 200 : 503).json({ ok: allOk, checks });
});

app.use('/api', authLimit,    authRouter);
app.use('/api', defaultLimit, cohortsRouter);
app.use('/api', defaultLimit, reviewsRouter);
app.use('/api', defaultLimit, rubricsRouter);
app.use('/api', defaultLimit, githubRouter);
app.use('/api', aiLimit,      analyzeRouter);
app.use('/api', aiLimit,      guideRouter);
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
  const server = app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });

  async function shutdown(signal: string) {
    console.log(`[server] ${signal} received — shutting down`);
    server.close(async () => {
      await Promise.allSettled([closeSql(), closeRedis()]);
      console.log('[server] clean exit');
      process.exit(0);
    });
    // Force exit if drain takes too long
    setTimeout(() => { console.error('[server] forced exit after timeout'); process.exit(1); }, 10_000);
  }

  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT',  () => { void shutdown('SIGINT'); });
}

start().catch((err) => {
  console.error('[startup fatal]', err);
  process.exit(1);
});
