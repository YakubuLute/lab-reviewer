import { useState, useEffect } from 'react';
import { getInitials, learnerColor } from '../data/learnerColors';
import { getCohorts } from '../lib/api';
import { getReviews } from '../lib/api';
import type { Review } from '../lib/api';
import type { Cohort, CohortLearner } from '../data/cohorts';

// ── Helpers ────────────────────────────────────────────────────────────────

function gradeMeta(g: string | null): { bg: string; fg: string } {
  if (g === 'Distinction') return { bg: 'var(--green-t)',  fg: 'var(--green-d)' };
  if (g === 'Merit')       return { bg: 'var(--blue-t)',   fg: 'var(--blue)' };
  if (g === 'Pass')        return { bg: 'var(--orange-t)', fg: 'var(--orange-d)' };
  return                          { bg: 'var(--amber-t)',  fg: 'var(--amber)' };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface LearnerSummary {
  learner: CohortLearner;
  cohortName: string;
  reviews: Review[];
  avg: number | null;
  latestGrade: string | null;
}

function buildSummaries(cohorts: Cohort[], reviews: Review[]): LearnerSummary[] {
  const summaries: LearnerSummary[] = [];
  for (const cohort of cohorts) {
    for (const learner of cohort.learners) {
      const lrv = reviews.filter(
        (r) => r.learnerEmail.toLowerCase() === learner.email.toLowerCase(),
      );
      const scored = lrv.filter((r) => r.totalScore != null);
      const avg = scored.length
        ? Math.round(scored.reduce((s, r) => s + (r.totalScore ?? 0), 0) / scored.length)
        : null;
      const latest = [...lrv].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
      summaries.push({
        learner,
        cohortName: cohort.name,
        reviews: lrv.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        avg,
        latestGrade: latest?.grade ?? null,
      });
    }
  }
  return summaries;
}

// ── Main view ──────────────────────────────────────────────────────────────

export default function LearnersView() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCohorts(), getReviews()])
      .then(([c, r]) => { setCohorts(c); setReviews(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summaries = buildSummaries(cohorts, reviews);

  useEffect(() => {
    if (!selectedEmail && summaries.length > 0) {
      setSelectedEmail(summaries[0]!.learner.email);
    }
  }, [summaries.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const sel = summaries.find((s) => s.learner.email === selectedEmail) ?? summaries[0] ?? null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--ink2)', fontSize: 13 }}>
        Loading learners...
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 40px', textAlign: 'center' }}>
        <div style={{ background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 16, padding: '52px 40px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>No learners yet</div>
          <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0, lineHeight: 1.6 }}>
            Add learners to a cohort from the Cohort Dashboard to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '258px 1fr', minHeight: '100%' }}>

      {/* ── Left: learner list ───────────────────────────────────────────── */}
      <div style={{ borderRight: '1px solid var(--line)', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '0 16px 12px', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink3)' }}>
          ALL LEARNERS · {summaries.length}
        </div>

        {summaries.map(({ learner, cohortName, avg, latestGrade }) => {
          const active = learner.email === selectedEmail;
          const { bg, fg } = learnerColor(learner.name);
          const gm = latestGrade ? gradeMeta(latestGrade) : null;
          return (
            <button
              key={learner.id}
              onClick={() => setSelectedEmail(learner.email)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, width: '100%',
                padding: '10px 16px', border: 'none', textAlign: 'left', cursor: 'pointer',
                background: active ? 'var(--orange-t)' : 'transparent',
                borderLeft: `3px solid ${active ? 'var(--orange)' : 'transparent'}`,
                fontFamily: 'var(--sans)', transition: 'background .1s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--line2)'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, background: bg, color: fg }}>
                {getInitials(learner.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {learner.name}
                  </span>
                  {learner.flagged && (
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--amber)', flexShrink: 0 }}>⚑</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: 'var(--ink3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cohortName}</span>
                  {gm && latestGrade && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: gm.bg, color: gm.fg, flexShrink: 0 }}>
                      {latestGrade}
                    </span>
                  )}
                  {avg != null && (
                    <span style={{ fontSize: 10, color: 'var(--ink3)', fontFamily: 'var(--mono)', flexShrink: 0 }}>{avg}%</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Right: learner profile ───────────────────────────────────────── */}
      {sel && (
        <div style={{ overflowY: 'auto', height: '100vh' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 70px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              {(() => {
                const { bg, fg } = learnerColor(sel.learner.name);
                return (
                  <div style={{ width: 60, height: 60, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 21, background: bg, color: fg }}>
                    {getInitials(sel.learner.name)}
                  </div>
                );
              })()}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', margin: 0, color: 'var(--ink)' }}>
                  {sel.learner.name}
                  {sel.learner.flagged && (
                    <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: 'var(--amber)', background: 'var(--amber-t)', padding: '3px 9px', borderRadius: 7, letterSpacing: '.03em', verticalAlign: 'middle' }}>
                      ⚑ FLAGGED
                    </span>
                  )}
                </h1>
                <div style={{ fontSize: 12, color: 'var(--ink3)', fontFamily: 'var(--mono)', marginTop: 3 }}>{sel.learner.email}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{sel.cohortName}</div>
              </div>
              <div style={{ display: 'flex', gap: 22 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--ink3)', letterSpacing: '.04em' }}>AVERAGE</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', marginTop: 2, color: 'var(--ink)' }}>
                    {sel.avg == null ? '—' : sel.avg + '%'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--ink3)', letterSpacing: '.04em' }}>REVIEWS</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', marginTop: 2, color: 'var(--ink)' }}>
                    {sel.reviews.length}
                  </div>
                </div>
                {sel.latestGrade && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--ink3)', letterSpacing: '.04em' }}>LATEST</div>
                    <div style={{ marginTop: 6 }}>
                      {(() => {
                        const gm = gradeMeta(sel.latestGrade);
                        return (
                          <span style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: gm.bg, color: gm.fg }}>
                            {sel.latestGrade}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Review history */}
            {sel.reviews.length > 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', marginTop: 26 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line2)' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Review history</h2>
                </div>

                {sel.reviews.map((r) => {
                  const gm = r.grade ? gradeMeta(r.grade) : null;
                  const isSent = !!r.emailSentAt;
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--line2)', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.labTitle}</span>
                          <span style={{ fontSize: 11, color: 'var(--ink2)', background: 'var(--line2)', padding: '2px 7px', borderRadius: 5 }}>
                            {r.attempt === '2nd' ? '2nd attempt (redo)' : '1st attempt'}
                          </span>
                          {r.redoFlag && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--amber)', background: 'var(--amber-t)', padding: '2px 7px', borderRadius: 5 }}>
                              Redo flagged
                            </span>
                          )}
                          {r.plagiarismConcern && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#C23838', background: '#FBE6E6', padding: '2px 7px', borderRadius: 5 }}>
                              Authorship concern
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 3, fontFamily: 'var(--mono)' }}>
                          {timeAgo(r.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        {r.totalScore != null && (
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                            {r.totalScore.toFixed(1)}%
                          </span>
                        )}
                        {gm && r.grade && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: gm.bg, color: gm.fg }}>
                            {r.grade}
                          </span>
                        )}
                        <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: isSent ? 'var(--green-t)' : 'var(--line2)', color: isSent ? 'var(--green-d)' : 'var(--ink3)' }}>
                          {isSent ? 'Sent' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ marginTop: 26, background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 14, padding: '36px 30px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>No reviews yet</div>
                <p style={{ fontSize: 12, color: 'var(--ink2)', margin: 0, lineHeight: 1.6 }}>
                  Reviews for {sel.learner.name} will appear here once completed.
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
