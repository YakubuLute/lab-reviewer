import type { FetchRepoResult, AnalysisResult } from '../../shared/types';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}: non-JSON response` })) as { error?: string } & T;
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  return json;
}

export function fetchRepo(repoUrl: string, branch?: string): Promise<FetchRepoResult> {
  return post<FetchRepoResult>('/api/fetch-repo', { repoUrl, branch: branch ?? undefined });
}

export function analyzeCode(payload: object): Promise<AnalysisResult> {
  return post<AnalysisResult>('/api/analyze', payload);
}

export function sendEmail(payload: { to: string; subject: string; html: string }): Promise<{ sent: boolean; messageId: string }> {
  return post('/api/send-email', payload);
}
