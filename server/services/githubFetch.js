/**
 * Fetches and flattens relevant source files from a public (or tokenized) GitHub repo.
 */

const CODE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.json', '.mjs', '.cjs']);
const IGNORED_PATHS = [
  'node_modules/', 'dist/', 'build/', '.next/', 'coverage/',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.min.js', '.min.css',
];
const MAX_FILE_BYTES = 100_000;       // skip individual files larger than 100 KB
const MAX_TOTAL_BYTES = 150_000;      // cap total payload at 150 KB of code

/**
 * Parse a GitHub URL into { owner, repo, branch }.
 * branch may be null if not specified in the URL (will be resolved from API).
 */
function parseGitHubUrl(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== 'github.com') throw new Error('Not a github.com URL');

    // Strip leading slash and .git suffix
    const parts = u.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
    if (parts.length < 2) throw new Error('URL must include owner/repo');

    const owner = parts[0];
    const repo = parts[1];

    // Handle /tree/<branch> segment
    let branch = null;
    const treeIdx = parts.indexOf('tree');
    if (treeIdx !== -1 && parts[treeIdx + 1]) {
      branch = parts.slice(treeIdx + 1).join('/');
    }

    return { owner, repo, branch };
  } catch (err) {
    const msg = err.message.startsWith('Not a') || err.message.startsWith('URL must')
      ? err.message
      : 'Invalid GitHub URL';
    const e = new Error(msg);
    e.status = 400;
    throw e;
  }
}

function githubHeaders() {
  const headers = { 'User-Agent': 'amalitech-lab-reviewer/1.0', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function githubGet(url) {
  const res = await fetch(url, { headers: githubHeaders() });
  if (res.status === 404) {
    const e = new Error('Repository not found. Check the URL, and make sure the repo is public (or provide a GITHUB_TOKEN with read access).');
    e.status = 404;
    throw e;
  }
  if (res.status === 403 || res.status === 429) {
    const e = new Error('GitHub rate limit reached. Set GITHUB_TOKEN in server/.env to raise the limit from 60 to 5000 requests/hour.');
    e.status = 429;
    throw e;
  }
  if (!res.ok) {
    const e = new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

function shouldInclude(filePath) {
  for (const ignored of IGNORED_PATHS) {
    if (filePath.includes(ignored)) return false;
  }
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  return CODE_EXTENSIONS.has(ext);
}

/**
 * Main entry point.
 * @param {string} repoUrl
 * @param {string|undefined} branchOverride
 * @returns {{ files: Array<{path: string, content: string}>, truncatedNote?: string }}
 */
export async function fetchRepo(repoUrl, branchOverride) {
  const { owner, repo, branch: urlBranch } = parseGitHubUrl(repoUrl);
  let branch = branchOverride || urlBranch;

  // Resolve default branch when not specified
  if (!branch) {
    const meta = await githubGet(`https://api.github.com/repos/${owner}/${repo}`);
    branch = meta.default_branch;
  }

  // Get the full file tree (recursive)
  const treeData = await githubGet(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
  );

  const blobs = (treeData.tree || []).filter(
    (item) => item.type === 'blob' && shouldInclude(item.path) && item.size <= MAX_FILE_BYTES,
  );

  // Fetch raw content via CDN (doesn't count against API rate limit)
  let totalBytes = 0;
  let truncatedNote;
  const files = [];

  for (const blob of blobs) {
    if (totalBytes >= MAX_TOTAL_BYTES) {
      truncatedNote = `Only the first ~${Math.round(MAX_TOTAL_BYTES / 1000)} KB of source files were loaded. ${blobs.length - files.length} file(s) were omitted to keep the analysis request manageable.`;
      break;
    }

    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${blob.path}`;
      const res = await fetch(rawUrl);
      if (!res.ok) continue;
      const content = await res.text();
      totalBytes += content.length;
      files.push({ path: blob.path, content });
    } catch {
      // Skip files that fail to fetch
    }
  }

  return { files, ...(truncatedNote && { truncatedNote }) };
}
