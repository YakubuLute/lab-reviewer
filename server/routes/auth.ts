import { scrypt, randomBytes, timingSafeEqual, type ScryptOptions } from 'crypto';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { signToken, requireAuth } from '../middleware/auth.js';
import { getSql } from '../db/connection.js';
import type { DbUser } from '../db/schema.js';

const router = Router();

// ── Password hashing — Node.js scrypt (no bcryptjs) ───────────────────────────

const KEYLEN  = 64;
const SCRYPT: ScryptOptions = { N: 16384, r: 8, p: 1 };

function scryptAsync(pw: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(pw, salt, KEYLEN, SCRYPT, (err, key) => { if (err) reject(err); else resolve(key); });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt);
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;
  const hash       = await scryptAsync(password, salt);
  const storedHash = Buffer.from(hashHex, 'hex');
  return hash.length === storedHash.length && timingSafeEqual(hash, storedHash);
}

// ── Validation ────────────────────────────────────────────────────────────────

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

function safeUser(u: DbUser) {
  return {
    id: u.id, firstName: u.firstName, lastName: u.lastName,
    email: u.email, role: u.role, specialization: u.specialization,
  };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
      return;
    }
    const { firstName, lastName, email, role, password } = parsed.data;
    const specialization = ROLE_SPECIALIZATION[role] ?? role;
    const sql = await getSql();

    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const [user]: DbUser[] = await sql`
      INSERT INTO users (first_name, last_name, email, role, specialization, password_hash)
      VALUES (${firstName}, ${lastName}, ${email}, ${role}, ${specialization}, ${passwordHash})
      RETURNING
        id,
        first_name      AS "firstName",
        last_name       AS "lastName",
        email,
        role,
        specialization,
        password_hash   AS "passwordHash"
    `;

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user: safeUser(user) });
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
    const sql = await getSql();

    const [user]: DbUser[] = await sql`
      SELECT id, first_name AS "firstName", last_name AS "lastName",
             email, role, specialization, password_hash AS "passwordHash"
      FROM users WHERE email = ${email} LIMIT 1
    `;

    if (!user) {
      res.status(401).json({ error: 'No account found with this email address.' });
      return;
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Incorrect password. Please try again.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/auth/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = await getSql();
    const [user]: DbUser[] = await sql`
      SELECT id, first_name AS "firstName", last_name AS "lastName",
             email, role, specialization
      FROM users WHERE id = ${req.jwtUser!.userId} LIMIT 1
    `;
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
});

export default router;
