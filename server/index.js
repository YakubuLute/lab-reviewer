import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load server/.env before any other imports that read process.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import githubRouter from './routes/github.js';
import analyzeRouter from './routes/analyze.js';
import emailRouter from './routes/email.js';

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json({ limit: '2mb' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', githubRouter);
app.use('/api', analyzeRouter);
app.use('/api', emailRouter);

// ── Centralized error handler ───────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(err.details && { details: err.details }),
  });
});

// ── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
