import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import githubRouter from './routes/github.js';
import analyzeRouter from './routes/analyze.js';
import emailRouter from './routes/email.js';

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }));
app.use('/api', githubRouter);
app.use('/api', analyzeRouter);
app.use('/api', emailRouter);

// Centralized error handler
app.use((err: Error & { status?: number; details?: unknown }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server error]', err);
  const status = err.status ?? 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(err.details !== undefined && { details: err.details }),
  });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
