import type { Lab, GradeInfo } from '../../shared/types';
import { PASSING_SCORE, getWeight } from '../data/scoring';

interface Props {
  lab: Lab | null;
  attempt: string;
  scores: Record<string, number>;
  totalScore: string;
  maxScore: number;
  grade: GradeInfo;
  passed: boolean;
  redoLab: boolean;
  plagiarism: boolean;
  isValid: boolean;
  canAnalyze: boolean;
  analyzeStatus: string;
  aiSuggested: boolean;
  isValid2: boolean;
  onAnalyze: () => void;
  onGenerate: () => void;
  report: unknown;
}

export default function LiveScorePanel({
  lab, attempt, scores, totalScore, maxScore, grade, passed,
  redoLab, plagiarism,
  isValid, canAnalyze, analyzeStatus, aiSuggested,
  isValid2, onAnalyze, onGenerate, report,
}: Props) {
  const isAnalyzing = analyzeStatus === 'analyzing';
  const scorePct = maxScore > 0 ? (parseFloat(totalScore) / maxScore) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Score card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line2)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Live Score</span>
        </div>
        <div style={{ padding: '16px' }}>
          {/* Big number */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700, color: grade.color, lineHeight: 1 }}>{totalScore}</span>
            <span style={{ fontSize: 13, color: 'var(--ink3)' }}>/ {maxScore}</span>
            <span style={{
              marginLeft: 4, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: passed ? 'var(--green-t)' : 'var(--red-t)',
              color: passed ? 'var(--green-d)' : 'var(--red)',
            }}>
              {grade.label}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: 'var(--line2)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%', borderRadius: 99, transition: 'width 0.3s',
              background: passed ? 'var(--green)' : 'var(--red)',
              width: `${Math.min(scorePct, 100)}%`,
            }} />
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--ink3)', marginBottom: 12 }}>
            Passing: {PASSING_SCORE} · Max: {maxScore}
          </div>

          {/* Per-criterion mini list */}
          {lab && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lab.criteria.map((c) => {
                const raw = scores[c.id] ?? 0;
                const ew = getWeight(c.weight, attempt);
                const weighted = ((raw / 5) * ew).toFixed(1);
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--ink2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ height: 3, background: 'var(--line2)', borderRadius: 99, marginTop: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: raw === 0 ? 'var(--line)' : 'var(--orange)', borderRadius: 99, width: `${(raw / 5) * 100}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: raw === 0 ? 'var(--ink3)' : 'var(--orange-d)', minWidth: 32, textAlign: 'right' }}>{weighted}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Flags card */}
      {(redoLab || plagiarism) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {redoLab && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>
              <span style={{ background: 'var(--amber-t)', borderRadius: 6, padding: '3px 8px' }}>⚠ Re-do required</span>
            </div>
          )}
          {plagiarism && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
              <span style={{ background: 'var(--red-t)', borderRadius: 6, padding: '3px 8px' }}>⚑ Plagiarism flagged</span>
            </div>
          )}
        </div>
      )}

      {/* AI suggested banner */}
      {aiSuggested && (
        <div style={{ padding: '10px 14px', background: 'var(--ai-t)', border: '1px solid var(--ai-line)', borderRadius: 11, fontSize: 11.5, color: 'var(--ai-d)', lineHeight: 1.5 }}>
          <strong style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>✦ AI</strong> — Scores and comments were pre-filled by Claude. Review each field before generating.
        </div>
      )}

      {/* Actions */}
      {!report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={onAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            style={{
              width: '100%', padding: '12px', borderRadius: 11, border: 'none', fontSize: 13, fontWeight: 600,
              cursor: canAnalyze && !isAnalyzing ? 'pointer' : 'not-allowed', fontFamily: 'var(--sans)',
              background: canAnalyze && !isAnalyzing ? 'var(--ai)' : 'var(--line2)',
              color: canAnalyze && !isAnalyzing ? '#fff' : 'var(--ink3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s',
            }}
          >
            {isAnalyzing
              ? <><span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'll-spin .8s linear infinite' }} />Analyzing…</>
              : '✦ Analyze with Claude'}
          </button>

          <button
            onClick={onGenerate}
            disabled={!isValid2}
            style={{
              width: '100%', padding: '12px', borderRadius: 11, border: 'none', fontSize: 13, fontWeight: 600,
              cursor: isValid2 ? 'pointer' : 'not-allowed', fontFamily: 'var(--sans)', transition: 'all 0.15s',
              background: isValid2 ? 'var(--orange)' : 'var(--line2)',
              color: isValid2 ? '#fff' : 'var(--ink3)',
              boxShadow: isValid2 ? '0 4px 12px rgba(242,107,33,.25)' : 'none',
            }}
          >
            Generate Report
          </button>

          {!isValid && (
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink3)', margin: 0 }}>
              Fill in reviewer name, learner and lab first
            </p>
          )}
        </div>
      )}
    </div>
  );
}
