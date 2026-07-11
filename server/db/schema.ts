import {
  pgTable, uuid, text, boolean, real,
  jsonb, timestamp, integer,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  firstName:      text('first_name').notNull(),
  lastName:       text('last_name').notNull(),
  email:          text('email').unique().notNull(),
  role:           text('role').notNull(),
  specialization: text('specialization').notNull(),
  passwordHash:   text('password_hash').notNull(),
  createdAt:      timestamp('created_at').defaultNow(),
});

export const cohorts = pgTable('cohorts', {
  id:           uuid('id').primaryKey().defaultRandom(),
  instructorId: uuid('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:         text('name').notNull(),
  track:        text('track').notNull(),
  createdAt:    timestamp('created_at').defaultNow(),
});

export const cohortLearners = pgTable('cohort_learners', {
  id:       uuid('id').primaryKey().defaultRandom(),
  cohortId: uuid('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  name:     text('name').notNull(),
  email:    text('email').notNull(),
  done:     integer('done').default(0).notNull(),
  grade:    text('grade').default('New').notNull(),
  avg:      real('avg'),
  flagged:  boolean('flagged').default(false).notNull(),
  bg:       text('bg').notNull(),
  fg:       text('fg').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cohortLabs = pgTable('cohort_labs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  cohortId:  uuid('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  due:       text('due'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reviews = pgTable('reviews', {
  id:                uuid('id').primaryKey().defaultRandom(),
  reviewerId:        uuid('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  learnerName:       text('learner_name').notNull(),
  learnerEmail:      text('learner_email').notNull(),
  labTitle:          text('lab_title').notNull(),
  attempt:           text('attempt').notNull(),
  totalScore:        real('total_score'),
  grade:             text('grade'),
  passed:            boolean('passed'),
  criteria:          jsonb('criteria'),
  strengths:         text('strengths'),
  gaps:              text('gaps'),
  otherRemarks:      text('other_remarks'),
  redoFlag:          boolean('redo_flag').default(false).notNull(),
  plagiarismConcern: boolean('plagiarism_concern').default(false).notNull(),
  emailSentAt:       timestamp('email_sent_at'),
  createdAt:         timestamp('created_at').defaultNow(),
});
