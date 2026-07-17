import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { getSql } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import type { DbRubricTemplate, DbRubricCriterion } from '../db/schema.js';

const router = Router();
router.use(requireAuth);

// ── GET /api/rubrics ──────────────────────────────────────────────────────────
// Returns system rubrics + caller's own, with criterion count but not full criteria.

router.get('/rubrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const rubrics = await sql`
      SELECT rt.id, rt.owner_id AS "ownerId", rt.name, rt.description,
             rt.created_at AS "createdAt", COUNT(rc.id)::int AS "criteriaCount"
      FROM rubric_templates rt
      LEFT JOIN rubric_criteria rc ON rc.rubric_id = rt.id
      WHERE rt.owner_id IS NULL OR rt.owner_id = ${userId}
      GROUP BY rt.id
      ORDER BY (rt.owner_id IS NULL) DESC, rt.created_at ASC
    ` as (DbRubricTemplate & { criteriaCount: number })[];

    res.json(rubrics.map((r) => ({ ...r, createdAt: (r.createdAt as Date).toISOString() })));
  } catch (err) { next(err); }
});

// ── GET /api/rubrics/:id ──────────────────────────────────────────────────────

router.get('/rubrics/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const [rubric]: DbRubricTemplate[] = await sql`
      SELECT id, owner_id AS "ownerId", name, description, created_at AS "createdAt"
      FROM rubric_templates
      WHERE id = ${req.params.id} AND (owner_id IS NULL OR owner_id = ${userId})
      LIMIT 1
    `;
    if (!rubric) { res.status(404).json({ error: 'Rubric not found' }); return; }

    const criteria: DbRubricCriterion[] = await sql`
      SELECT id, rubric_id AS "rubricId", criterion_key AS "criterionKey",
             name, description, weight, sort_order AS "sortOrder"
      FROM rubric_criteria
      WHERE rubric_id = ${req.params.id}
      ORDER BY sort_order ASC, id ASC
    `;

    res.json({ ...rubric, createdAt: (rubric.createdAt as Date).toISOString(), criteria });
  } catch (err) { next(err); }
});

// ── POST /api/rubrics ─────────────────────────────────────────────────────────

const RubricSchema = z.object({
  name:        z.string().min(1).max(200).trim(),
  description: z.string().max(500).trim().default(''),
});

router.post('/rubrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RubricSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const [rubric]: DbRubricTemplate[] = await sql`
      INSERT INTO rubric_templates (owner_id, name, description)
      VALUES (${userId}, ${parsed.data.name}, ${parsed.data.description})
      RETURNING id, owner_id AS "ownerId", name, description, created_at AS "createdAt"
    `;
    res.status(201).json({ ...rubric, createdAt: (rubric.createdAt as Date).toISOString(), criteria: [] });
  } catch (err) { next(err); }
});

// ── PUT /api/rubrics/:id ──────────────────────────────────────────────────────

router.put('/rubrics/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RubricSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const [rubric]: DbRubricTemplate[] = await sql`
      UPDATE rubric_templates SET name = ${parsed.data.name}, description = ${parsed.data.description}
      WHERE id = ${req.params.id} AND owner_id = ${userId}
      RETURNING id, owner_id AS "ownerId", name, description, created_at AS "createdAt"
    `;
    if (!rubric) { res.status(404).json({ error: 'Rubric not found or not editable' }); return; }
    res.json({ ...rubric, createdAt: (rubric.createdAt as Date).toISOString() });
  } catch (err) { next(err); }
});

// ── DELETE /api/rubrics/:id ───────────────────────────────────────────────────

router.delete('/rubrics/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const [row]: { id: string }[] = await sql`
      DELETE FROM rubric_templates WHERE id = ${req.params.id} AND owner_id = ${userId} RETURNING id
    `;
    if (!row) { res.status(404).json({ error: 'Rubric not found or not deletable' }); return; }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── POST /api/rubrics/:id/clone ───────────────────────────────────────────────

router.post('/rubrics/:id/clone', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const [source]: DbRubricTemplate[] = await sql`
      SELECT id, name, description FROM rubric_templates
      WHERE id = ${req.params.id} AND (owner_id IS NULL OR owner_id = ${userId})
      LIMIT 1
    `;
    if (!source) { res.status(404).json({ error: 'Rubric not found' }); return; }

    const [cloned]: DbRubricTemplate[] = await sql`
      INSERT INTO rubric_templates (owner_id, name, description)
      VALUES (${userId}, ${source.name + ' (copy)'}, ${source.description})
      RETURNING id, owner_id AS "ownerId", name, description, created_at AS "createdAt"
    `;

    const sourceCriteria: DbRubricCriterion[] = await sql`
      SELECT criterion_key AS "criterionKey", name, description, weight, sort_order AS "sortOrder"
      FROM rubric_criteria WHERE rubric_id = ${source.id} ORDER BY sort_order ASC
    `;

    let criteria: DbRubricCriterion[] = [];
    if (sourceCriteria.length > 0) {
      const criteriaData = sourceCriteria.map((c) => ({
        rubric_id: cloned.id,
        criterion_key: c.criterionKey,
        name: c.name,
        description: c.description,
        weight: c.weight,
        sort_order: c.sortOrder,
      }));
      criteria = await sql`
        INSERT INTO rubric_criteria ${sql(criteriaData, 'rubric_id', 'criterion_key', 'name', 'description', 'weight', 'sort_order')}
        RETURNING id, rubric_id AS "rubricId", criterion_key AS "criterionKey", name, description, weight, sort_order AS "sortOrder"
      `;
    }

    res.status(201).json({ ...cloned, createdAt: (cloned.createdAt as Date).toISOString(), criteria });
  } catch (err) { next(err); }
});

// ── POST /api/rubrics/:id/criteria ────────────────────────────────────────────

const CriterionSchema = z.object({
  name:         z.string().min(1).max(200).trim(),
  description:  z.string().max(500).trim().default(''),
  weight:       z.number().int().min(1).max(100),
  criterionKey: z.string().min(1).max(100).trim().optional(),
});

router.post('/rubrics/:id/criteria', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriterionSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const [owner]: { id: string }[] = await sql`
      SELECT id FROM rubric_templates WHERE id = ${req.params.id} AND owner_id = ${userId} LIMIT 1
    `;
    if (!owner) { res.status(404).json({ error: 'Rubric not found or not editable' }); return; }

    const [{ maxOrder }]: [{ maxOrder: number | null }] = await sql`
      SELECT MAX(sort_order) AS "maxOrder" FROM rubric_criteria WHERE rubric_id = ${req.params.id}
    `;
    const sortOrder = (maxOrder ?? -1) + 1;

    const criterionKey = parsed.data.criterionKey
      || parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40) + '_' + Date.now().toString(36);

    const [criterion]: DbRubricCriterion[] = await sql`
      INSERT INTO rubric_criteria (rubric_id, criterion_key, name, description, weight, sort_order)
      VALUES (${req.params.id}, ${criterionKey}, ${parsed.data.name}, ${parsed.data.description}, ${parsed.data.weight}, ${sortOrder})
      RETURNING id, rubric_id AS "rubricId", criterion_key AS "criterionKey", name, description, weight, sort_order AS "sortOrder"
    `;
    res.status(201).json(criterion);
  } catch (err) { next(err); }
});

// ── PUT /api/rubrics/:id/criteria/:cid ───────────────────────────────────────

router.put('/rubrics/:id/criteria/:cid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriterionSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return; }

    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const [row]: { id: string }[] = await sql`
      SELECT rc.id FROM rubric_criteria rc
      JOIN rubric_templates rt ON rc.rubric_id = rt.id
      WHERE rc.id = ${req.params.cid} AND rt.owner_id = ${userId}
      LIMIT 1
    `;
    if (!row) { res.status(404).json({ error: 'Criterion not found or not editable' }); return; }

    const [updated]: DbRubricCriterion[] = await sql`
      UPDATE rubric_criteria SET name = ${parsed.data.name}, description = ${parsed.data.description}, weight = ${parsed.data.weight}
      WHERE id = ${req.params.cid}
      RETURNING id, rubric_id AS "rubricId", criterion_key AS "criterionKey", name, description, weight, sort_order AS "sortOrder"
    `;
    res.json(updated);
  } catch (err) { next(err); }
});

// ── DELETE /api/rubrics/:id/criteria/:cid ────────────────────────────────────

router.delete('/rubrics/:id/criteria/:cid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = await getSql();
    const userId = req.jwtUser!.userId;

    const [row]: { id: string }[] = await sql`
      SELECT rc.id FROM rubric_criteria rc
      JOIN rubric_templates rt ON rc.rubric_id = rt.id
      WHERE rc.id = ${req.params.cid} AND rt.owner_id = ${userId}
      LIMIT 1
    `;
    if (!row) { res.status(404).json({ error: 'Criterion not found or not deletable' }); return; }

    await sql`DELETE FROM rubric_criteria WHERE id = ${req.params.cid}`;
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
