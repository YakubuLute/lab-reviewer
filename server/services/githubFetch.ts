import type { FetchRepoResult } from '../../shared/types.js';

const CODE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.json', '.mjs', '.cjs']);
const IGNORED_PATHS = [
  'node_modules/', 'dist/', 'build/', '.next/', 'coverage/',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.min.js', '.min.css',
];
const MAX_FILE_BYTES = 100_000;
const MAX_TOTAL_BYTES = 150_000;

interface ParsedUrl {
  owner: string;
  repo: string;
  branch: string | null;
}

function parseGitHubUrl(url: string): ParsedUrl {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    const e = Object.assign(new Error('Invalid GitHub URL'), { status: 400 });
    throw e;
  }

  if (u.hostname !== 'github.com') {
    throw Object.assign(new Error('Not a github.com URL'), { status: 400 });
  }

  const parts = u.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
  if (parts.length < 2) {
    throw Object.assign(new Error('URL must include owner/repo'), { status: 400 });
  }

  const owner = parts[0];
  const repo = parts[1];

  const treeIdx = parts.indexOf('tree');
  const branch = treeIdx !== -1 && parts[treeIdx + 1]
    ? parts.slice(treeIdx + 1).join('/')
    : null;

  return { owner, repo, branch };
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'amalitech-lab-reviewer/1.0',
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function githubGet(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: githubHeaders() });
  if (res.status === 404) throw Object.assign(new Error('Repository not found. Check the URL, and make sure the repo is public (or provide a GITHUB_TOKEN with read access).'), { status: 404 });
  if (res.status === 403 || res.status === 429) throw Object.assign(new Error('GitHub rate limit reached. Set GITHUB_TOKEN in server/.env to raise the limit from 60 to 5000 requests/hour.'), { status: 429 });
  if (!res.ok) throw Object.assign(new Error(`GitHub API error: ${res.status} ${res.statusText}`), { status: res.status });
  return res.json();
}

function shouldInclude(filePath: string): boolean {
  for (const ignored of IGNORED_PATHS) {
    if (filePath.includes(ignored)) return false;
  }
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  return CODE_EXTENSIONS.has(ext);
}

export async function fetchRepo(repoUrl: string, branchOverride?: string): Promise<FetchRepoResult> {
  const { owner, repo, branch: urlBranch } = parseGitHubUrl(repoUrl);
  let branch = branchOverride ?? urlBranch;

  if (!branch) {
    const meta = await githubGet(`https://api.github.com/repos/${owner}/${repo}`) as { default_branch: string };
    branch = meta.default_branch;
  }

  const treeData = await githubGet(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
  ) as { tree: Array<{ type: string; path: string; size: number }> };

  const blobs = (treeData.tree ?? []).filter(
    (item) => item.type === 'blob' && shouldInclude(item.path) && item.size <= MAX_FILE_BYTES,
  );

  let totalBytes = 0;
  let truncatedNote: string | undefined;
  const files: FetchRepoResult['files'] = [];

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
      // skip files that fail to fetch
    }
  }

  return { files, ...(truncatedNote !== undefined && { truncatedNote }) };
}
