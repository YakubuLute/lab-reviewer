// ── Lab data ────────────────────────────────────────────────────────────────

export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface Lab {
  description: string;
  criteria: Criterion[];
}

export type LabData = Record<string, Lab>;

// ── Learners ─────────────────────────────────────────────────────────────────

export interface Learner {
  name: string;
  email: string;
}

// ── Code input ────────────────────────────────────────────────────────────────

export interface CodeFile {
  path: string;
  content: string;
}

export interface FetchRepoResult {
  files: CodeFile[];
  truncatedNote?: string;
}

// ── AI analysis ───────────────────────────────────────────────────────────────

export interface CriterionResult {
  id: string;
  name: string;
  weight: number;
  score: number;
  comment: string;
}

export type Grade = 'Distinction' | 'Merit' | 'Pass' | 'Needs Work';

export interface AnalysisResult {
  criteria: CriterionResult[];
  totalScore: number;
  grade: Grade;
  passed: boolean;
  redoRecommended: boolean;
  plagiarismConcern: boolean;
  strengths: string;
  gaps: string;
  otherRemarks: string;
  suggestedSubject: string;
  emailBody: string;
}

// ── Scoring / report ──────────────────────────────────────────────────────────

export interface GradeInfo {
  label: string;
  color: string;
}

export interface CriterionRow {
  criterion: string;
  weight: number;
  effectiveWeight: number;
  rating: string;
  rawScore: number;
  weightedScore: number;
  feedback: string;
}

export interface ReportData {
  learnerName: string;
  learnerEmail: string;
  selectedLab: string;
  attempt: string;
  totalScore: string;
  maxScore: number;
  grade: GradeInfo;
  passed: boolean;
  redoLab: boolean;
  plagiarism: boolean;
  strengths: string;
  improvements: string;
  otherRemarks: string;
  reviewerName: string;
  reviewDate: string;
  criteriaRows: CriterionRow[];
}

export interface Report extends ReportData {
  html: string;
  excelRow: string;
  subject: string;
  aiEmailBody: string;
}
