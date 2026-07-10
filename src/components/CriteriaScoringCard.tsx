import type { Lab, GradeInfo } from '../../shared/types';
import { RATING_LABELS, getWeight } from '../data/scoring';
import { S } from '../styles/formStyles';

interface Props {
  lab: Lab;
  attempt: string;
  scores: Record<string, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  feedbacks: Record<string, string>;
  setFeedbacks: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  totalScore: string;
  grade: GradeInfo;
  maxScore: number;
  passed: boolean;
}

export default function CriteriaScoringCard({ lab, attempt, scores, setScores, feedbacks, setFeedbacks, totalScore, grade, maxScore, passed }: Props) {
  return (
    <div style={S.card}>
      <div style={{ ...S.cardHeader, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={S.stepNum}>03</span>
          <span style={{ fontSize: 1.5, color: 'var(--line)', margin: '0 4px' }}>·</span>
          <span style={S.cardTitle}>Criteria Scoring</span>
        </div>
        {/* Live score summary in header */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: grade.color, fontFamily: 'var(--mono)' }}>{totalScore}</span>
          <span style={{ fontSize: 12, color: 'var(--ink3)' }}>/ {maxScore}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: passed ? 'var(--green-t)' : 'var(--red-t)', color: passed ? 'var(--green-d)' : 'var(--red)' }}>
            {grade.label}
          </span>
        </div>
      </div>

      <div style={S.cardBody}>
        {lab.criteria.map((c) => {
          const raw = scores[c.id] ?? 0;
          const ew = getWeight(c.weight, attempt);
          return (
            <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 11, padding: '14px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 600, background: 'var(--orange-t)', color: 'var(--orange-d)', padding: '2px 7px', borderRadius: 6 }}>
                      {ew}%{attempt === '2nd' ? ` (base ${c.weight}%)` : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 3, lineHeight: 1.5 }}>{c.description}</p>
                </div>
                <div style={{ textAlign: 'center', minWidth: 52, marginLeft: 12 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: raw === 0 ? 'var(--ink3)' : 'var(--orange)' }}>{raw}<span style={{ fontSize: 12, color: 'var(--ink3)' }}>/5</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <input
                  type="range" min={0} max={5} step={1} value={raw}
                  onChange={(e) => setScores((p) => ({ ...p, [c.id]: parseInt(e.target.value) }))}
                  style={{ flex: 1, accentColor: 'var(--orange)' }}
                />
                <span style={{ fontSize: 11.5, color: raw === 0 ? 'var(--ink3)' : 'var(--ink2)', minWidth: 90, textAlign: 'right', fontStyle: raw === 0 ? 'italic' : 'normal' }}>
                  {RATING_LABELS[raw]}
                </span>
              </div>

              <input
                type="text"
                placeholder="Inline comment for this criterion…"
                value={feedbacks[c.id] ?? ''}
                onChange={(e) => setFeedbacks((p) => ({ ...p, [c.id]: e.target.value }))}
                style={{ ...S.input, fontSize: 12, background: 'var(--line2)' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
