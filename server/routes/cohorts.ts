import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { eq, inArray, asc } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { cohorts, cohortLearners, cohortLabs } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All cohort routes require authentication
router.use(requireAuth);

const AVATAR_PALETTE: [string, string][] = [
  ['#FCE7D8', '#C2530B'],
  ['#E2ECFB', '#2A57C9'],
  ['#E3F4EB', '#15824E'],
  ['#EFE9FB', '#6B46C1'],
  ['#FBF0DA', '#9A6B0C'],
  ['#E6F2F2', '#0E7C7B'],
  ['#FBE6E6', '#C23838'],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function buildCohortResponse(cohortId: string) {
  const [cohort, learners, labs] = await Promise.all([
    db.select().from(cohorts).where(eq(cohorts.id, cohortId)).limit(1),
    db.select().from(cohortLearners).where(eq(cohortLearners.cohortId, cohortId)).orderBy(asc(cohortLearners.createdAt)),
    db.select().from(cohortLabs).where(eq(cohortLabs.cohortId, cohortId)).orderBy(asc(cohortLabs.createdAt)),
  ]);
  if (!cohort[0]) return null;
  return {
    ...cohort[0],
    instructorId: cohort[0].instructorId,
    createdAt: cohort[0].createdAt?.toISOString() ?? new Date().toISOString(),
    learners: learners.map(l => ({ ...l, createdAt: undefined })),
    labs: labs.map(l => ({ ...l, due: l.due ?? '', createdAt: undefined })),
  };
}

// ── GET /api/cohorts ──────────────────────────────────────────────────────────

router.get('/cohorts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtUser!.userId;
    const userCohorts = await db
      .select()
      .from(cohorts)
      .where(eq(cohorts.instructorId, userId))
      .orderBy(asc(cohorts.createdAt));

    if (userCohorts.length === 0) {
      res.json([]);
      return;
    }

    const cohortIds = userCohorts.map(c => c.id);
    const [allLearners, allLabs] = await Promise.all([
      db.select().from(cohortLearners).where(inArray(cohortLearners.cohortId, cohortIds)).orderBy(asc(cohortLearners.createdAt)),
      db.select().from(cohortLabs).where(inArray(cohortLabs.cohortId, cohortIds)).orderBy(asc(cohortLabs.createdAt)),
    ]);

    const result = userCohorts.map(c => ({
      ...c,
      createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
      learners: allLearners
        .filter(l => l.cohortId === c.id)
        .map(l => ({ ...l, createdAt: undefined })),
      labs: allLabs
        .filter(l => l.cohortId === c.id)
        .map(l => ({ ...l, due: l.due ?? '', createdAt: undefined })),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/cohorts ─────────────────────────────────────────────────────────

const CreateCohortSchema = z.object({
  name:  z.string().min(1).max(200).trim(),
  track: z.string().min(1).max(100).trim(),
});

router.post('/cohorts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateCohortSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
      return;
    }
    const [cohort] = await db
      .insert(cohorts)
      .values({ instructorId: req.jwtUser!.userId, ...parsed.data })
      .returning();

    res.status(201).json({
      ...cohort,
      createdAt: cohort.createdAt?.toISOString() ?? new Date().toISOString(),
      learners: [],
      labs: [],
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/cohorts/:id ───────────────────────────────────────────────────

router.delete('/cohorts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtUser!.userId;
    const row = await db.select({ instructorId: cohorts.instructorId }).from(cohorts).where(eq(cohorts.id, req.params.id)).limit(1);
    if (!row[0] || row[0].instructorId !== userId) {
      res.status(404).json({ error: 'Cohort not found' });
      return;
    }
    await db.delete(cohorts).where(eq(cohorts.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/cohorts/:id/learners ────────────────────────────────────────────

const AddLearnerSchema = z.object({
  name:          z.string().min(1).max(200).trim(),
  email:         z.string().email().optional().or(z.literal('')),
  learnerCount:  z.number().int().min(0).default(0), // client sends current count for palette assignment
});

router.post('/cohorts/:id/learners', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohort = await db.select({ instructorId: cohorts.instructorId }).from(cohorts).where(eq(cohorts.id, req.params.id)).limit(1);
    if (!cohort[0] || cohort[0].instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' });
      return;
    }

    const parsed = AddLearnerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
      return;
    }
    const { name, email, learnerCount } = parsed.data;

    const resolvedEmail = (email && email.trim())
      ? email.trim()
      : name.toLowerCase().split(/\s+/).slice(0, 2).join('.') + '@amalitech.org';

    const [bg, fg] = AVATAR_PALETTE[learnerCount % AVATAR_PALETTE.length] as [string, string];

    const [learner] = await db
      .insert(cohortLearners)
      .values({ cohortId: req.params.id, name, email: resolvedEmail, bg, fg })
      .returning();

    res.status(201).json({ ...learner, createdAt: undefined });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/cohorts/:id/learners/:learnerId ────────────────────────────────

const PatchLearnerSchema = z.object({
  name:    z.string().min(1).max(200).trim().optional(),
  email:   z.string().email().optional(),
  done:    z.number().int().min(0).optional(),
  grade:   z.string().optional(),
  avg:     z.number().nullable().optional(),
  flagged: z.boolean().optional(),
}).strict();

router.patch('/cohorts/:id/learners/:learnerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohort = await db.select({ instructorId: cohorts.instructorId }).from(cohorts).where(eq(cohorts.id, req.params.id)).limit(1);
    if (!cohort[0] || cohort[0].instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' });
      return;
    }

    const parsed = PatchLearnerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
      return;
    }

    const [updated] = await db
      .update(cohortLearners)
      .set(parsed.data)
      .where(eq(cohortLearners.id, req.params.learnerId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Learner not found' });
      return;
    }
    res.json({ ...updated, createdAt: undefined });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/cohorts/:id/learners/:learnerId ───────────────────────────────

router.delete('/cohorts/:id/learners/:learnerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohort = await db.select({ instructorId: cohorts.instructorId }).from(cohorts).where(eq(cohorts.id, req.params.id)).limit(1);
    if (!cohort[0] || cohort[0].instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' });
      return;
    }
    await db.delete(cohortLearners).where(eq(cohortLearners.id, req.params.learnerId));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/cohorts/:id/labs ────────────────────────────────────────────────

const AddLabSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  due:  z.string().optional().default(''),
});

router.post('/cohorts/:id/labs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohort = await db.select({ instructorId: cohorts.instructorId }).from(cohorts).where(eq(cohorts.id, req.params.id)).limit(1);
    if (!cohort[0] || cohort[0].instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' });
      return;
    }

    const parsed = AddLabSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
      return;
    }

    const [lab] = await db
      .insert(cohortLabs)
      .values({ cohortId: req.params.id, name: parsed.data.name, due: parsed.data.due || null })
      .returning();

    res.status(201).json({ ...lab, due: lab.due ?? '', createdAt: undefined });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/cohorts/:id/labs/:labId ───────────────────────────────────────

router.patch('/cohorts/:id/labs/:labId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohort = await db.select({ instructorId: cohorts.instructorId }).from(cohorts).where(eq(cohorts.id, req.params.id)).limit(1);
    if (!cohort[0] || cohort[0].instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' });
      return;
    }

    const { due } = z.object({ due: z.string() }).parse(req.body);
    const [updated] = await db
      .update(cohortLabs)
      .set({ due: due || null })
      .where(eq(cohortLabs.id, req.params.labId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Lab not found' });
      return;
    }
    res.json({ ...updated, due: updated.due ?? '', createdAt: undefined });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/cohorts/:id/labs/:labId ──────────────────────────────────────

router.delete('/cohorts/:id/labs/:labId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohort = await db.select({ instructorId: cohorts.instructorId }).from(cohorts).where(eq(cohorts.id, req.params.id)).limit(1);
    if (!cohort[0] || cohort[0].instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' });
      return;
    }
    await db.delete(cohortLabs).where(eq(cohortLabs.id, req.params.labId));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
