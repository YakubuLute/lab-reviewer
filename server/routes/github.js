import { Router } from 'express';
import { fetchRepo } from '../services/githubFetch.js';

const router = Router();

router.post('/fetch-repo', async (req, res, next) => {
  try {
    const { repoUrl, branch } = req.body;
    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ error: 'repoUrl is required' });
    }
    const result = await fetchRepo(repoUrl.trim(), branch?.trim() || undefined);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
