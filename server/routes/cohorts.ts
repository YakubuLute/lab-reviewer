import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { getSql } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import type { DbCohort, DbCohortLearner, DbCohortLab } from '../db/schema.js';

const router = Router();
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

// ── GET /api/cohorts ──────────────────────────────────────────────────────────

router.get('/cohorts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql    = await getSql();
    const userId = req.jwtUser!.userId;

    const userCohorts: DbCohort[] = await sql`
      SELECT id, instructor_id AS "instructorId", name, track, created_at AS "createdAt"
      FROM cohorts WHERE instructor_id = ${userId} ORDER BY created_at ASC
    `;

    if (userCohorts.length === 0) { res.json([]); return; }

    // Fetch learners and labs for all cohorts in two queries (via JOIN)
    const [allLearners, allLabs]: [DbCohortLearner[], DbCohortLab[]] = await Promise.all([
      sql`
        SELECT cl.id, cl.cohort_id AS "cohortId", cl.name, cl.email,
               cl.done, cl.grade, cl.avg, cl.flagged, cl.bg, cl.fg
        FROM cohort_learners cl
        INNER JOIN cohorts c ON cl.cohort_id = c.id
        WHERE c.instructor_id = ${userId}
        ORDER BY cl.created_at ASC
      `,
      sql`
        SELECT cl.id, cl.cohort_id AS "cohortId", cl.name, cl.due
        FROM cohort_labs cl
        INNER JOIN cohorts c ON cl.cohort_id = c.id
        WHERE c.instructor_id = ${userId}
        ORDER BY cl.created_at ASC
      `,
    ]);

    const result = userCohorts.map((c) => ({
      id: c.id, name: c.name, track: c.track, instructorId: c.instructorId,
      createdAt: (c.createdAt as Date).toISOString(),
      learners: allLearners.filter((l) => l.cohortId === c.id),
      labs: allLabs.filter((l) => l.cohortId === c.id).map((l) => ({ ...l, due: l.due ?? '' })),
    }));

    res.json(result);
  } catch (err) { next(err); }
});

// ── POST /api/cohorts ─────────────────────────────────────────────────────────

const CreateCohortSchema = z.object({
  name:  z.string().min(1).max(200).trim(),
  track: z.string().min(1).max(100).trim(),
});

router.post('/cohorts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateCohortSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

    const sql = await getSql();
    const [cohort]: DbCohort[] = await sql`
      INSERT INTO cohorts (instructor_id, name, track)
      VALUES (${req.jwtUser!.userId}, ${parsed.data.name}, ${parsed.data.track})
      RETURNING id, instructor_id AS "instructorId", name, track, created_at AS "createdAt"
    `;

    res.status(201).json({
      id: cohort.id, name: cohort.name, track: cohort.track,
      instructorId: cohort.instructorId,
      createdAt: (cohort.createdAt as Date).toISOString(),
      learners: [], labs: [],
    });
  } catch (err) { next(err); }
});

// ── DELETE /api/cohorts/:id ───────────────────────────────────────────────────

router.delete('/cohorts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql  = await getSql();
    const [row]: { instructorId: string }[] = await sql`
      SELECT instructor_id AS "instructorId" FROM cohorts WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!row || row.instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' }); return;
    }
    await sql`DELETE FROM cohorts WHERE id = ${req.params.id}`;
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── POST /api/cohorts/:id/learners ────────────────────────────────────────────

const AddLearnerSchema = z.object({
  name:         z.string().min(1).max(200).trim(),
  email:        z.string().email().optional().or(z.literal('')),
  learnerCount: z.number().int().min(0).default(0),
});

router.post('/cohorts/:id/learners', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql     = await getSql();
    const [owner]: { instructorId: string }[] = await sql`
      SELECT instructor_id AS "instructorId" FROM cohorts WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!owner || owner.instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' }); return;
    }

    const parsed = AddLearnerSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

    const { name, email, learnerCount } = parsed.data;
    const resolvedEmail = email?.trim() || name.toLowerCase().split(/\s+/).slice(0, 2).join('.') + '@amalitech.org';
    const [bg, fg] = AVATAR_PALETTE[learnerCount % AVATAR_PALETTE.length] as [string, string];

    const [learner]: DbCohortLearner[] = await sql`
      INSERT INTO cohort_learners (cohort_id, name, email, bg, fg)
      VALUES (${req.params.id}, ${name}, ${resolvedEmail}, ${bg}, ${fg})
      RETURNING id, cohort_id AS "cohortId", name, email, done, grade, avg, flagged, bg, fg
    `;

    res.status(201).json(learner);
  } catch (err) { next(err); }
});

// ── POST /api/cohorts/:id/learners/bulk ──────────────────────────────────────

function parseCsv(text: string): Array<{ name: string; email?: string }> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const sep = (lines[0] ?? '').includes(';') ? ';' : ',';

  // Detect header row (contains "name" or "email" as a column heading)
  const firstCells = (lines[0] ?? '').toLowerCase().split(sep).map((c) => c.replace(/^["']|["']$/g, '').trim());
  const hasHeader = firstCells.some((c) => c === 'name' || c === 'email' || c === 'full name');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const nameIdx  = hasHeader ? firstCells.findIndex((c) => c.includes('name'))  : 0;
  const emailIdx = hasHeader ? firstCells.findIndex((c) => c.includes('email')) : 1;

  return dataLines
    .map((line) => {
      const parts = line.split(sep).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const name  = parts[nameIdx >= 0 ? nameIdx : 0]?.trim() ?? '';
      const email = emailIdx >= 0 ? (parts[emailIdx]?.trim() || undefined) : undefined;
      return { name, email };
    })
    .filter((r) => r.name.length > 0);
}

router.post('/cohorts/:id/learners/bulk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql     = await getSql();
    const [owner]: { instructorId: string }[] = await sql`
      SELECT instructor_id AS "instructorId" FROM cohorts WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!owner || owner.instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' }); return;
    }

    const { csv } = z.object({ csv: z.string().min(1) }).parse(req.body);
    const rows = parseCsv(csv);
    if (rows.length === 0) { res.status(400).json({ error: 'No valid rows found in CSV' }); return; }
    if (rows.length > 500) { res.status(400).json({ error: 'Maximum 500 learners per upload' }); return; }

    const [{ count }]: [{ count: number }] = await sql`
      SELECT COUNT(*)::int AS count FROM cohort_learners WHERE cohort_id = ${req.params.id}
    `;
    let offset = count;

    const insertData = rows.map((row, i) => ({
      cohort_id: req.params.id,
      name: row.name,
      email: row.email?.trim() || row.name.toLowerCase().split(/\s+/).slice(0, 2).join('.') + '@amalitech.org',
      bg: (AVATAR_PALETTE[(offset + i) % AVATAR_PALETTE.length] as [string, string])[0],
      fg: (AVATAR_PALETTE[(offset + i) % AVATAR_PALETTE.length] as [string, string])[1],
    }));

    const inserted: DbCohortLearner[] = await sql`
      INSERT INTO cohort_learners ${sql(insertData, 'cohort_id', 'name', 'email', 'bg', 'fg')}
      ON CONFLICT (cohort_id, email) DO NOTHING
      RETURNING id, cohort_id AS "cohortId", name, email, done, grade, avg, flagged, bg, fg
    `;

    res.status(201).json({ added: inserted.length, learners: inserted });
  } catch (err) { next(err); }
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
    const sql     = await getSql();
    const [owner]: { instructorId: string }[] = await sql`
      SELECT instructor_id AS "instructorId" FROM cohorts WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!owner || owner.instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' }); return;
    }

    const parsed = PatchLearnerSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

    const patch = parsed.data;
    const updates: Record<string, unknown> = {};
    if (patch.name    !== undefined) updates.name    = patch.name;
    if (patch.email   !== undefined) updates.email   = patch.email;
    if (patch.done    !== undefined) updates.done    = patch.done;
    if (patch.grade   !== undefined) updates.grade   = patch.grade;
    if (patch.avg     !== undefined) updates.avg     = patch.avg;
    if (patch.flagged !== undefined) updates.flagged = patch.flagged;

    if (Object.keys(updates).length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

    const [updated]: DbCohortLearner[] = await sql`
      UPDATE cohort_learners SET ${sql(updates)}
      WHERE id = ${req.params.learnerId}
      RETURNING id, cohort_id AS "cohortId", name, email, done, grade, avg, flagged, bg, fg
    `;
    if (!updated) { res.status(404).json({ error: 'Learner not found' }); return; }
    res.json(updated);
  } catch (err) { next(err); }
});

// ── DELETE /api/cohorts/:id/learners/:learnerId ───────────────────────────────

router.delete('/cohorts/:id/learners/:learnerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql     = await getSql();
    const [owner]: { instructorId: string }[] = await sql`
      SELECT instructor_id AS "instructorId" FROM cohorts WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!owner || owner.instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' }); return;
    }
    await sql`DELETE FROM cohort_learners WHERE id = ${req.params.learnerId}`;
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── POST /api/cohorts/:id/labs ────────────────────────────────────────────────

const AddLabSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  due:  z.string().optional().default(''),
});

router.post('/cohorts/:id/labs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql     = await getSql();
    const [owner]: { instructorId: string }[] = await sql`
      SELECT instructor_id AS "instructorId" FROM cohorts WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!owner || owner.instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' }); return;
    }

    const parsed = AddLabSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

    const [lab]: DbCohortLab[] = await sql`
      INSERT INTO cohort_labs (cohort_id, name, due)
      VALUES (${req.params.id}, ${parsed.data.name}, ${parsed.data.due || null})
      RETURNING id, cohort_id AS "cohortId", name, due
    `;

    res.status(201).json({ ...lab, due: lab.due ?? '' });
  } catch (err) { next(err); }
});

// ── PATCH /api/cohorts/:id/labs/:labId ───────────────────────────────────────

router.patch('/cohorts/:id/labs/:labId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql     = await getSql();
    const [owner]: { instructorId: string }[] = await sql`
      SELECT instructor_id AS "instructorId" FROM cohorts WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!owner || owner.instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' }); return;
    }

    const { due } = z.object({ due: z.string() }).parse(req.body);
    const [updated]: DbCohortLab[] = await sql`
      UPDATE cohort_labs SET due = ${due || null}
      WHERE id = ${req.params.labId}
      RETURNING id, cohort_id AS "cohortId", name, due
    `;
    if (!updated) { res.status(404).json({ error: 'Lab not found' }); return; }
    res.json({ ...updated, due: updated.due ?? '' });
  } catch (err) { next(err); }
});

// ── DELETE /api/cohorts/:id/labs/:labId ──────────────────────────────────────

router.delete('/cohorts/:id/labs/:labId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql     = await getSql();
    const [owner]: { instructorId: string }[] = await sql`
      SELECT instructor_id AS "instructorId" FROM cohorts WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!owner || owner.instructorId !== req.jwtUser!.userId) {
      res.status(404).json({ error: 'Cohort not found' }); return;
    }
    await sql`DELETE FROM cohort_labs WHERE id = ${req.params.labId}`;
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
