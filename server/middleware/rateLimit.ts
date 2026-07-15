import type { Request, Response, NextFunction } from 'express';

// ── In-memory rate limiter (no external packages required) ────────────────────
// Uses a shared Map keyed by IP. Entries are cleaned up periodically.

interface Entry { count: number; resetAt: number; }
const store = new Map<string, Entry>();

// Garbage-collect expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key);
  }
}, 5 * 60_000).unref();

export function rateLimit(opts: { max: number; windowMs: number; message: string }) {
  const { max, windowMs, message } = opts;
  return (req: Request, res: Response, next: NextFunction): void => {
    const key   = (req.ip ?? req.socket.remoteAddress ?? 'unknown');
    const now   = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 3, resetAt: now + windowMs });
      next();
      return;
    }
    if (entry.count >= max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      res.status(429).json({ error: message });
      return;
    }
    entry.count++;
    next();
  };
}
