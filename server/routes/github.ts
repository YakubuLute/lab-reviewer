import { Router, type Request, type Response, type NextFunction } from 'express';
import { fetchRepo } from '../services/githubFetch.js';
import { cacheGet, cacheSet } from '../redis/cache.js';

const router = Router();

const GITHUB_CACHE_TTL = 60 * 60 * 2; // 2 hours

interface FetchRepoBody {
  repoUrl?: string;
  branch?: string;
}

router.post('/fetch-repo', async (req: Request<object, object, FetchRepoBody>, res: Response, next: NextFunction) => {
  try {
    const { repoUrl, branch } = req.body;
    if (!repoUrl || typeof repoUrl !== 'string') {
      res.status(400).json({ error: 'repoUrl is required' });
      return;
    }

    const normalizedUrl = repoUrl.trim().toLowerCase();
    const normalizedBranch = branch?.trim() || 'default';
    const cacheKey = `gh:${normalizedUrl}:${normalizedBranch}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const result = await fetchRepo(repoUrl.trim(), branch?.trim() || undefined);

    await cacheSet(cacheKey, result, GITHUB_CACHE_TTL);
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
