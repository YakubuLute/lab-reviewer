import type { FetchRepoResult, AnalysisResult } from '../../shared/types';
import type { AuthUser, TrainerRole } from '../auth/useAuth';
import type { Cohort, CohortLearner, CohortLab } from '../data/cohorts';

// ── Token storage ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'lablens_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Base request helpers ───────────────────────────────────────────────────────

function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}: non-JSON response` })) as { error?: string } & T;
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  return json;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function authRegister(
  firstName: string, lastName: string, email: string,
  role: TrainerRole, password: string,
): Promise<AuthResponse> {
  return post('/api/auth/register', { firstName, lastName, email, role, password });
}

export function authLogin(email: string, password: string): Promise<AuthResponse> {
  return post('/api/auth/login', { email, password });
}

export function authMe(): Promise<AuthUser> {
  return get('/api/auth/me');
}

// ── Cohorts ───────────────────────────────────────────────────────────────────

export function getCohorts(): Promise<Cohort[]> {
  return get('/api/cohorts');
}

export function createCohortApi(name: string, track: string): Promise<Cohort> {
  return post('/api/cohorts', { name, track });
}

export function deleteCohortApi(id: string): Promise<{ ok: boolean }> {
  return del(`/api/cohorts/${id}`);
}

export function addLearnerApi(
  cohortId: string, name: string, email: string | undefined, learnerCount: number,
): Promise<CohortLearner> {
  return post(`/api/cohorts/${cohortId}/learners`, { name, email, learnerCount });
}

export function updateLearnerApi(
  cohortId: string, learnerId: string, patch_: Partial<CohortLearner>,
): Promise<CohortLearner> {
  return patch(`/api/cohorts/${cohortId}/learners/${learnerId}`, patch_);
}

export function removeLearnerApi(cohortId: string, learnerId: string): Promise<{ ok: boolean }> {
  return del(`/api/cohorts/${cohortId}/learners/${learnerId}`);
}

export function bulkAddLearnersApi(
  cohortId: string, csv: string,
): Promise<{ added: number; learners: CohortLearner[] }> {
  return post(`/api/cohorts/${cohortId}/learners/bulk`, { csv });
}

export function addLabApi(cohortId: string, name: string, due: string, rubricId?: string): Promise<CohortLab> {
  return post(`/api/cohorts/${cohortId}/labs`, { name, due, ...(rubricId && { rubricId }) });
}

export function updateLabDueApi(cohortId: string, labId: string, due: string): Promise<CohortLab> {
  return patch(`/api/cohorts/${cohortId}/labs/${labId}`, { due });
}

export function removeLabApi(cohortId: string, labId: string): Promise<{ ok: boolean }> {
  return del(`/api/cohorts/${cohortId}/labs/${labId}`);
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface SaveReviewPayload {
  learnerName: string;
  learnerEmail: string;
  labTitle: string;
  attempt: '1st' | '2nd';
  totalScore?: number;
  grade?: string;
  passed?: boolean;
  criteria?: unknown[];
  strengths?: string;
  gaps?: string;
  otherRemarks?: string;
  redoFlag?: boolean;
  plagiarismConcern?: boolean;
}

export interface Review {
  id: string;
  reviewerId: string;
  learnerName: string;
  learnerEmail: string;
  labTitle: string;
  attempt: string;
  totalScore: number | null;
  grade: string | null;
  passed: boolean | null;
  redoFlag: boolean;
  plagiarismConcern: boolean;
  emailSentAt: string | null;
  createdAt: string;
}

export function saveReview(payload: SaveReviewPayload): Promise<Review> {
  return post('/api/reviews', payload);
}

export function getReviews(): Promise<Review[]> {
  return get('/api/reviews');
}

export function markReviewEmailSent(id: string): Promise<{ id: string; emailSentAt: string }> {
  return request(`/api/reviews/${id}/mark-sent`, { method: 'PATCH' });
}

// ── Existing API surface (unchanged) ─────────────────────────────────────────

export function fetchRepo(repoUrl: string, branch?: string): Promise<FetchRepoResult> {
  return post<FetchRepoResult>('/api/fetch-repo', { repoUrl, branch: branch ?? undefined });
}

export function analyzeCode(payload: object): Promise<AnalysisResult> {
  return post<AnalysisResult>('/api/analyze', payload);
}

export function sendEmail(payload: { to: string; cc?: string; subject: string; html: string }): Promise<{ sent: boolean; messageId: string }> {
  return post('/api/send-email', payload);
}

export function generateGuide(payload: {
  learnerName: string;
  labTitle: string;
  attempt: string;
  codeFiles?: { path: string; content: string }[];
}): Promise<import('../data/guides').Guide> {
  return post('/api/generate-guide', payload);
}

// ── Rubrics ───────────────────────────────────────────────────────────────────

export interface RubricCriterion {
  id: string;
  rubricId: string;
  criterionKey: string;
  name: string;
  description: string;
  weight: number;
  sortOrder: number;
}

export interface RubricTemplate {
  id: string;
  ownerId: string | null;
  name: string;
  description: string;
  createdAt: string;
  criteriaCount?: number;
  criteria?: RubricCriterion[];
}

export function getRubrics(): Promise<(RubricTemplate & { criteriaCount: number })[]> {
  return get('/api/rubrics');
}

export function getRubric(id: string): Promise<RubricTemplate & { criteria: RubricCriterion[] }> {
  return get(`/api/rubrics/${id}`);
}

export function createRubric(name: string, description: string): Promise<RubricTemplate & { criteria: RubricCriterion[] }> {
  return post('/api/rubrics', { name, description });
}

export function updateRubricApi(id: string, name: string, description: string): Promise<RubricTemplate> {
  return put(`/api/rubrics/${id}`, { name, description });
}

export function deleteRubricApi(id: string): Promise<{ ok: boolean }> {
  return del(`/api/rubrics/${id}`);
}

export function cloneRubricApi(id: string): Promise<RubricTemplate & { criteria: RubricCriterion[] }> {
  return post(`/api/rubrics/${id}/clone`, {});
}

export function addRubricCriterion(
  rubricId: string,
  criterion: { name: string; description: string; weight: number; criterionKey?: string },
): Promise<RubricCriterion> {
  return post(`/api/rubrics/${rubricId}/criteria`, criterion);
}

export function updateRubricCriterion(
  rubricId: string,
  criterionId: string,
  criterion: { name: string; description: string; weight: number },
): Promise<RubricCriterion> {
  return put(`/api/rubrics/${rubricId}/criteria/${criterionId}`, criterion);
}

export function deleteRubricCriterion(rubricId: string, criterionId: string): Promise<{ ok: boolean }> {
  return del(`/api/rubrics/${rubricId}/criteria/${criterionId}`);
}
