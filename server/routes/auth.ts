import { Router, type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

const ROLE_SPECIALIZATION: Record<string, string> = {
  'Backend Trainer':  'Backend · Node.js',
  'Frontend Trainer': 'Frontend · React/Vue',
  'DevOps Trainer':   'DevOps',
  'UI/UX Trainer':    'UI/UX Design',
  'QA Trainer':       'QA & Testing',
};

const VALID_ROLES = Object.keys(ROLE_SPECIALIZATION) as [string, ...string[]];

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

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ firstName, lastName, email, role, specialization: ROLE_SPECIALIZATION[role] ?? role, passwordHash })
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

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (rows.length === 0) {
      res.status(401).json({ error: 'No account found with this email address.' });
      return;
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
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
