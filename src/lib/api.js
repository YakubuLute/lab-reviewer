/**
 * Thin wrappers around the /api/* backend routes.
 * All secrets stay server-side; these functions only shape the request/response.
 */

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}: non-JSON response` }));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

/**
 * Fetch source files from a GitHub repository.
 * @param {string} repoUrl
 * @param {string} [branch]
 * @returns {Promise<{files: Array<{path: string, content: string}>, truncatedNote?: string}>}
 */
export function fetchRepo(repoUrl, branch) {
  return post('/api/fetch-repo', { repoUrl, branch: branch || undefined });
}

/**
 * Send the learner's code + reviewer notes to the AI for analysis.
 * @param {object} payload
 * @returns {Promise<object>} Structured review result
 */
export function analyzeCode(payload) {
  return post('/api/analyze', payload);
}

/**
 * Send the final report email via the backend.
 * @param {object} payload  { to, subject, html }
 * @returns {Promise<{sent: boolean, messageId: string}>}
 */
export function sendEmail(payload) {
  return post('/api/send-email', payload);
}
