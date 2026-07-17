const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name     TEXT        NOT NULL,
    last_name      TEXT        NOT NULL,
    email          TEXT        UNIQUE NOT NULL,
    role           TEXT        NOT NULL,
    specialization TEXT        NOT NULL,
    password_hash  TEXT        NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS rubric_templates (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS rubric_templates_system_name
    ON rubric_templates (name) WHERE owner_id IS NULL;

  CREATE TABLE IF NOT EXISTS rubric_criteria (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    rubric_id     UUID    NOT NULL REFERENCES rubric_templates(id) ON DELETE CASCADE,
    criterion_key TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    description   TEXT    NOT NULL DEFAULT '',
    weight        INTEGER NOT NULL,
    sort_order    INTEGER NOT NULL DEFAULT 0
  );

  CREATE UNIQUE INDEX IF NOT EXISTS rubric_criteria_rubric_key
    ON rubric_criteria (rubric_id, criterion_key);

  CREATE TABLE IF NOT EXISTS cohorts (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          TEXT        NOT NULL,
    track         TEXT        NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS cohort_learners (
    id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id  UUID    NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    done       INTEGER DEFAULT 0    NOT NULL,
    grade      TEXT    DEFAULT 'New' NOT NULL,
    avg        REAL,
    flagged    BOOLEAN DEFAULT FALSE NOT NULL,
    bg         TEXT    NOT NULL,
    fg         TEXT    NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS cohort_learners_cohort_email
    ON cohort_learners (cohort_id, email);

  CREATE TABLE IF NOT EXISTS cohort_labs (
    id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id  UUID    NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    due        TEXT,
    rubric_id  UUID    REFERENCES rubric_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE cohort_labs ADD COLUMN IF NOT EXISTS rubric_id UUID REFERENCES rubric_templates(id) ON DELETE SET NULL;

  CREATE TABLE IF NOT EXISTS reviews (
    id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id        UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learner_name       TEXT    NOT NULL,
    learner_email      TEXT    NOT NULL,
    lab_title          TEXT    NOT NULL,
    attempt            TEXT    NOT NULL,
    total_score        REAL,
    grade              TEXT,
    passed             BOOLEAN,
    criteria           JSONB,
    strengths          TEXT,
    gaps               TEXT,
    other_remarks      TEXT,
    redo_flag          BOOLEAN DEFAULT FALSE NOT NULL,
    plagiarism_concern BOOLEAN DEFAULT FALSE NOT NULL,
    email_sent_at      TIMESTAMPTZ,
    created_at         TIMESTAMPTZ DEFAULT NOW()
  );
`;

export async function runMigrations(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('[db] DATABASE_URL is required');

  let postgres: typeof import('postgres').default;
  try {
    const mod = await import('postgres');
    postgres = mod.default;
  } catch {
    throw new Error('postgres package not installed. Run: npm install postgres');
  }

  const sql = postgres(url, { max: 1 });
  try {
    await sql.unsafe(SCHEMA_SQL);
    console.log('[db] schema ready');

    // Seed system rubrics (idempotent — only runs when none exist)
    const [row] = await sql`SELECT COUNT(*)::int AS count FROM rubric_templates WHERE owner_id IS NULL` as [{ count: number }];
    if (row.count === 0) {
      const { LAB_DATA } = await import('../../shared/labs.js');
      for (const [labName, lab] of Object.entries(LAB_DATA)) {
        const [template] = await sql`
          INSERT INTO rubric_templates (owner_id, name, description)
          VALUES (NULL, ${labName}, ${lab.description})
          ON CONFLICT DO NOTHING
          RETURNING id
        ` as [{ id: string }];
        if (!template) continue;
        for (let i = 0; i < lab.criteria.length; i++) {
          const c = lab.criteria[i]!;
          await sql`
            INSERT INTO rubric_criteria (rubric_id, criterion_key, name, description, weight, sort_order)
            VALUES (${template.id}, ${c.id}, ${c.name}, ${c.description}, ${c.weight}, ${i})
          `;
        }
      }
      console.log('[db] seeded 6 system rubrics');
    }
  } finally {
    await sql.end();
  }
}
