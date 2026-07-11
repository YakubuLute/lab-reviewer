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

  CREATE TABLE IF NOT EXISTS cohort_labs (
    id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id  UUID    NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    due        TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

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
  } finally {
    await sql.end();
  }
}
