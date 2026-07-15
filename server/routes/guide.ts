import { createHash } from 'crypto';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { LAB_DATA } from '../../shared/labs.js';
import type { CodeFile } from '../../shared/types.js';
import { buildGuideSystemPrompt, buildGuideUserMessage } from '../prompts/guidePrompt.js';
import { callClaude } from '../services/anthropic.js';
import { cacheGet, cacheSet } from '../redis/cache.js';

const router = Router();
router.use(requireAuth);

const GUIDE_CACHE_TTL = 60 * 60 * 4; // 4 hours

interface GuideBody {
  learnerName?: string;
  labTitle?: string;
  attempt?: string;
  codeFiles?: CodeFile[];
}

function validate(body: GuideBody): string | null {
  const { learnerName, labTitle, attempt } = body;
  if (!learnerName || typeof learnerName !== 'string') return 'learnerName is required';
  if (!labTitle   || typeof labTitle   !== 'string') return 'labTitle is required';
  if (!LAB_DATA[labTitle]) return `Unknown lab: "${labTitle}"`;
  if (!['1st', '2nd'].includes(attempt ?? '')) return 'attempt must be "1st" or "2nd"';
  return null;
}

router.post('/generate-guide', async (
  req: Request<object, object, GuideBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validationError = validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const { learnerName, labTitle, attempt, codeFiles = [] } =
      req.body as Required<Pick<GuideBody, 'learnerName' | 'labTitle' | 'attempt'>> & GuideBody;

    if (!Array.isArray(codeFiles)) {
      res.status(400).json({ error: 'codeFiles must be an array' });
      return;
    }

    const cachePayload = JSON.stringify({ learnerName, labTitle, attempt, codeFiles });
    const cacheKey = `guide:${createHash('sha256').update(cachePayload).digest('hex')}`;

    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const systemPrompt = buildGuideSystemPrompt(labTitle, attempt);
    const userMessage  = buildGuideUserMessage(learnerName, labTitle, attempt, codeFiles);

    let result: unknown;
    try {
      result = await callClaude(systemPrompt, userMessage);
    } catch (err) {
      const e = err as Error & { status?: number; rawText?: string };
      if (e.status === 502) {
        res.status(502).json({ error: e.message, rawText: e.rawText });
        return;
      }
      throw err;
    }

    await cacheSet(cacheKey, result, GUIDE_CACHE_TTL);
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
