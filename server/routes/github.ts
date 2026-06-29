import { Router, type Request, type Response, type NextFunction } from 'express';
import { fetchRepo } from '../services/githubFetch.js';

const router = Router();

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
    const result = await fetchRepo(repoUrl.trim(), branch?.trim() || undefined);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
