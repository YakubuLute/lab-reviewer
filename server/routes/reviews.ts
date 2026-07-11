import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { reviews } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// ── POST /api/reviews ─────────────────────────────────────────────────────────

const SaveReviewSchema = z.object({
  learnerName:       z.string().min(1),
  learnerEmail:      z.string().email(),
  labTitle:          z.string().min(1),
  attempt:           z.enum(['1st', '2nd']),
  totalScore:        z.number().optional(),
  grade:             z.string().optional(),
  passed:            z.boolean().optional(),
  criteria:          z.array(z.unknown()).optional(),
  strengths:         z.string().optional(),
  gaps:              z.string().optional(),
  otherRemarks:      z.string().optional(),
  redoFlag:          z.boolean().default(false),
  plagiarismConcern: z.boolean().default(false),
  emailSentAt:       z.string().datetime().optional(),
});

router.post('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = SaveReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
      return;
    }

    const { emailSentAt, criteria, ...rest } = parsed.data;
    const [review] = await db
      .insert(reviews)
      .values({
        reviewerId: req.jwtUser!.userId,
        ...rest,
        criteria: criteria ?? null,
        emailSentAt: emailSentAt ? new Date(emailSentAt) : null,
      })
      .returning();

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/reviews ──────────────────────────────────────────────────────────

router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewerId, req.jwtUser!.userId))
      .orderBy(desc(reviews.createdAt))
      .limit(100);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
