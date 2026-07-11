// Pure TypeScript types mirroring the SQL schema defined in migrate.ts.
// No external package imports — usable without any npm installs.

export interface DbUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  specialization: string;
  passwordHash: string;
  createdAt: Date;
}

export interface DbCohort {
  id: string;
  instructorId: string;
  name: string;
  track: string;
  createdAt: Date;
}

export interface DbCohortLearner {
  id: string;
  cohortId: string;
  name: string;
  email: string;
  done: number;
  grade: string;
  avg: number | null;
  flagged: boolean;
  bg: string;
  fg: string;
}

export interface DbCohortLab {
  id: string;
  cohortId: string;
  name: string;
  due: string | null;
}

export interface DbReview {
  id: string;
  reviewerId: string;
  learnerName: string;
  learnerEmail: string;
  labTitle: string;
  attempt: string;
  totalScore: number | null;
  grade: string | null;
  passed: boolean | null;
  criteria: unknown;
  strengths: string | null;
  gaps: string | null;
  otherRemarks: string | null;
  redoFlag: boolean;
  plagiarismConcern: boolean;
  emailSentAt: Date | null;
  createdAt: Date;
}
