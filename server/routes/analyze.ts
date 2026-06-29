import { Router, type Request, type Response, type NextFunction } from 'express';
import { LAB_DATA } from '../../shared/labs.js';
import type { CodeFile, CriterionResult, AnalysisResult } from '../../shared/types.js';
import { buildSystemPrompt, buildUserMessage } from '../prompts/reviewPrompt.js';
import { callClaude } from '../services/anthropic.js';

const router = Router();

// ── Grade helpers (mirrors src/data/scoring.ts) ──────────────────────────────

function computeTotal(criteria: CriterionResult[], attempt: string): number {
  const scale = attempt === '2nd' ? 0.8 : 1;
  return criteria.reduce((sum, c) => sum + (c.score / 5) * c.weight * scale, 0);
}

function gradeLabel(totalScore: number, attempt: string): AnalysisResult['grade'] {
  const max = attempt === '2nd' ? 80 : 100;
  const pct = (totalScore / max) * 100;
  if (totalScore >= 80) {
    if (pct >= 95) return 'Distinction';
    if (pct >= 85) return 'Merit';
    return 'Pass';
  }
  return 'Needs Work';
}

// ── Request body ─────────────────────────────────────────────────────────────

interface AnalyzeBody {
  learnerName?: string;
  labTitle?: string;
  attempt?: string;
  reviewerName?: string;
  reviewerNotes?: string;
  codeFiles?: CodeFile[];
}

function validate(body: AnalyzeBody): string | null {
  const { learnerName, labTitle, attempt, reviewerName } = body;
  if (!learnerName || typeof learnerName !== 'string') return 'learnerName is required';
  if (!labTitle || typeof labTitle !== 'string') return 'labTitle is required';
  if (!LAB_DATA[labTitle]) return `Unknown lab: "${labTitle}"`;
  if (!['1st', '2nd'].includes(attempt ?? '')) return 'attempt must be "1st" or "2nd"';
  if (!reviewerName || typeof reviewerName !== 'string') return 'reviewerName is required';
  return null;
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post('/analyze', async (req: Request<object, object, AnalyzeBody>, res: Response, next: NextFunction) => {
  try {
    const validationError = validate(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const { learnerName, labTitle, attempt, reviewerNotes, codeFiles, reviewerName } = req.body as Required<Pick<AnalyzeBody, 'learnerName' | 'labTitle' | 'attempt' | 'reviewerName'>> & AnalyzeBody;

    if (codeFiles !== undefined) {
      if (!Array.isArray(codeFiles)) {
        res.status(400).json({ error: 'codeFiles must be an array' });
        return;
      }
      for (const f of codeFiles) {
        if (typeof f.path !== 'string' || typeof f.content !== 'string') {
          res.status(400).json({ error: 'Each codeFile must have string path and content fields' });
          return;
        }
      }
    }

    const firstName = learnerName.trim().split(/\s+/)[0];
    const systemPrompt = buildSystemPrompt({ labTitle, attempt, firstName });
    const userMessage = buildUserMessage({ learnerName, reviewerName, reviewerNotes, codeFiles });

    let parsed: AnalysisResult;
    try {
      parsed = await callClaude(systemPrompt, userMessage) as AnalysisResult;
    } catch (err) {
      const e = err as Error & { status?: number; rawText?: string };
      if (e.status === 502) {
        res.status(502).json({ error: e.message, rawText: e.rawText });
        return;
      }
      throw err;
    }

    // Server-side score verification
    const labCriteria = LAB_DATA[labTitle].criteria;
    const criteriaMap = Object.fromEntries(labCriteria.map((c) => [c.id, c]));

    const sanitizedCriteria: CriterionResult[] = (parsed.criteria ?? []).map((c) => {
      const canonical = criteriaMap[c.id];
      return {
        id: c.id,
        name: canonical?.name ?? c.name,
        weight: canonical?.weight ?? c.weight,
        score: Math.max(0, Math.min(5, Math.round(Number(c.score) || 0))),
        comment: typeof c.comment === 'string' ? c.comment : '',
      };
    });

    const recomputedTotal = parseFloat(computeTotal(sanitizedCriteria, attempt).toFixed(1));
    const recomputedGrade = gradeLabel(recomputedTotal, attempt);
    const recomputedPassed = recomputedTotal >= 80;

    res.json({
      ...parsed,
      criteria: sanitizedCriteria,
      totalScore: recomputedTotal,
      grade: recomputedGrade,
      passed: recomputedPassed,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
