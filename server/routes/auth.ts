import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { signToken, requireAuth } from '../middleware/auth.js';
import { getDb } from '../db/connection.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();
const scryptAsync = promisify(scrypt);

// ── Password hashing — Node.js scrypt (no bcryptjs needed) ────────────────────

const KEYLEN = 64;
const SCRYPT = { N: 16384, r: 8, p: 1 };

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, KEYLEN, SCRYPT)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;
  const hash       = (await scryptAsync(password, salt, KEYLEN, SCRYPT)) as Buffer;
  const storedHash = Buffer.from(hashHex, 'hex');
  return hash.length === storedHash.length && timingSafeEqual(hash, storedHash);
}

// ── Validation schemas ────────────────────────────────────────────────────────

const VALID_ROLES = [
  'Backend Trainer', 'Frontend Trainer', 'DevOps Trainer', 'UI/UX Trainer', 'QA Trainer',
] as const;

const ROLE_SPECIALIZATION: Record<string, string> = {
  'Backend Trainer':  'Backend · Node.js',
  'Frontend Trainer': 'Frontend · React/Vue',
  'DevOps Trainer':   'DevOps',
  'UI/UX Trainer':    'UI/UX Design',
  'QA Trainer':       'QA & Testing',
};

const RegisterSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName:  z.string().min(1).max(100).trim(),
  email:     z.string().email().toLowerCase(),
  role:      z.enum(VALID_ROLES),
  password:  z.string().min(8).max(128),
});

const LoginSchema = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1),
});

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
      return;
    }
    const { firstName, lastName, email, role, password } = parsed.data;
    const db = await getDb();

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash  = await hashPassword(password);
    const specialization = ROLE_SPECIALIZATION[role] ?? role;
    const [user] = await db
      .insert(users)
      .values({ firstName, lastName, email, role, specialization, passwordHash })
      .returning({
        id: users.id, firstName: users.firstName, lastName: users.lastName,
        email: users.email, role: users.role, specialization: users.specialization,
      });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid email or password format' });
      return;
    }
    const { email, password } = parsed.data;
    const db = await getDb();

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (rows.length === 0) {
      res.status(401).json({ error: 'No account found with this email address.' });
      return;
    }

    const user = rows[0];
    if (!(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Incorrect password. Please try again.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: {
        id: user.id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, specialization: user.specialization,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/auth/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db   = await getDb();
    const rows = await db.select().from(users).where(eq(users.id, req.jwtUser!.userId)).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const u = rows[0];
    res.json({
      id: u.id, firstName: u.firstName, lastName: u.lastName,
      email: u.email, role: u.role, specialization: u.specialization,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
