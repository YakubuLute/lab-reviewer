import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { getSql } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import type { DbReview } from '../db/schema.js';

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

    const {
      learnerName, learnerEmail, labTitle, attempt, totalScore, grade, passed,
      criteria, strengths, gaps, otherRemarks, redoFlag, plagiarismConcern, emailSentAt,
    } = parsed.data;

    const sql = await getSql();
    const [review]: DbReview[] = await sql`
      INSERT INTO reviews (
        reviewer_id, learner_name, learner_email, lab_title, attempt,
        total_score, grade, passed, criteria, strengths, gaps, other_remarks,
        redo_flag, plagiarism_concern, email_sent_at
      ) VALUES (
        ${req.jwtUser!.userId}, ${learnerName}, ${learnerEmail}, ${labTitle}, ${attempt},
        ${totalScore ?? null}, ${grade ?? null}, ${passed ?? null},
        ${criteria ? JSON.stringify(criteria) : null},
        ${strengths ?? null}, ${gaps ?? null}, ${otherRemarks ?? null},
        ${redoFlag}, ${plagiarismConcern},
        ${emailSentAt ? new Date(emailSentAt) : null}
      )
      RETURNING
        id, reviewer_id AS "reviewerId",
        learner_name AS "learnerName", learner_email AS "learnerEmail",
        lab_title AS "labTitle", attempt,
        total_score AS "totalScore", grade, passed, criteria,
        strengths, gaps, other_remarks AS "otherRemarks",
        redo_flag AS "redoFlag", plagiarism_concern AS "plagiarismConcern",
        email_sent_at AS "emailSentAt", created_at AS "createdAt"
    `;

    res.status(201).json(review);
  } catch (err) { next(err); }
});

// ── GET /api/reviews ──────────────────────────────────────────────────────────

router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit  = Math.min(Math.max(parseInt(String(req.query.limit  ?? '100'), 10) || 100, 1), 500);
    const offset = Math.max(parseInt(String(req.query.offset ?? '0'),   10) || 0, 0);

    const sql  = await getSql();
    const rows: DbReview[] = await sql`
      SELECT
        id, reviewer_id AS "reviewerId",
        learner_name AS "learnerName", learner_email AS "learnerEmail",
        lab_title AS "labTitle", attempt,
        total_score AS "totalScore", grade, passed, criteria,
        strengths, gaps, other_remarks AS "otherRemarks",
        redo_flag AS "redoFlag", plagiarism_concern AS "plagiarismConcern",
        email_sent_at AS "emailSentAt", created_at AS "createdAt"
      FROM reviews
      WHERE reviewer_id = ${req.jwtUser!.userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    res.json(rows);
  } catch (err) { next(err); }
});

// ── PATCH /api/reviews/:id/mark-sent ─────────────────────────────────────────

router.patch('/reviews/:id/mark-sent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = await getSql();
    const [row]: { reviewerId: string }[] = await sql`
      SELECT reviewer_id AS "reviewerId" FROM reviews WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!row || row.reviewerId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Review not found' }); return;
    }
    const [updated]: Pick<DbReview, 'id' | 'emailSentAt'>[] = await sql`
      UPDATE reviews SET email_sent_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING id, email_sent_at AS "emailSentAt"
    `;
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
