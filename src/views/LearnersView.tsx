import { useState } from 'react';
import { getInitials } from '../data/learnerColors';

// ── Types ──────────────────────────────────────────────────────────────────

interface TrajEntry {
  lab: string; attempt: number; score: number; grade: string; date: string; cap?: boolean;
}

interface AuthEntry {
  date: string; text: string; dot: string;
}

interface LearnerProfile {
  id: string; name: string; email: string;
  done: number; grade: string; avg: number | null;
  flagged: boolean; bg: string; fg: string;
  trajectory: TrajEntry[];
  strengths: string[];
  gaps: string[];
  authorship: AuthEntry[];
}

// ── Seed data ──────────────────────────────────────────────────────────────

const LABS_TOTAL = 6;

const LEARNERS: LearnerProfile[] = [
  {
    id: 'ama', name: 'Ama Osei', email: 'ama.osei@amalitech.org',
    done: 4, grade: 'Pass', avg: 81, flagged: false, bg: '#FCE7D8', fg: '#C2530B',
    trajectory: [
      { lab: 'RESTful Task Tracker',    attempt: 1, score: 81, grade: 'Pass',      date: 'May 12' },
      { lab: 'Task Tracker — Database', attempt: 1, score: 74, grade: 'Needs Work', date: 'May 19' },
      { lab: 'Task Tracker — Database', attempt: 2, score: 80, grade: 'Pass',       date: 'May 23', cap: true },
      { lab: 'Task Tracker with Auth',  attempt: 1, score: 86, grade: 'Merit',      date: 'Jun 2' },
      { lab: 'Media Library API',       attempt: 1, score: 88, grade: 'Merit',      date: 'Jun 11' },
    ],
    strengths: ['Consistent response envelopes', 'Clean, conventional folder structure', 'Genuinely RESTful routing'],
    gaps: ['Centralized error handling', 'Test coverage on edge cases', 'Explaining middleware order'],
    authorship: [
      { date: 'Jun 2',  text: 'Explained the JWT auth flow confidently and end-to-end.',                                                                                           dot: 'var(--green)' },
      { date: 'May 23', text: 'Walked through the DB schema fixes herself — clearly her own work.',                                                                                dot: 'var(--green)' },
      { date: 'May 19', text: 'Could not explain why the validation middleware runs first. Flagged for follow-up; resolved on re-submission.',                                     dot: 'var(--amber)' },
    ],
  },
  {
    id: 'kwame', name: 'Kwame Mensah', email: 'kwame.mensah@amalitech.org',
    done: 5, grade: 'Merit', avg: 87, flagged: false, bg: '#E2ECFB', fg: '#2A57C9',
    trajectory: [
      { lab: 'RESTful Task Tracker',    attempt: 1, score: 88, grade: 'Merit',      date: 'May 12' },
      { lab: 'Task Tracker — Database', attempt: 1, score: 85, grade: 'Merit',      date: 'May 20' },
      { lab: 'Task Tracker with Auth',  attempt: 1, score: 91, grade: 'Distinction',date: 'Jun 3' },
      { lab: 'Media Library API',       attempt: 1, score: 83, grade: 'Merit',      date: 'Jun 13' },
      { lab: 'Media Library — Uploads', attempt: 1, score: 87, grade: 'Merit',      date: 'Jul 1' },
    ],
    strengths: ['Strong JWT implementation', 'Solid async/await patterns', 'Well-structured project layout'],
    gaps: ['File upload edge cases', 'Pagination implementation', 'Test coverage for auth routes'],
    authorship: [
      { date: 'Jun 3',  text: 'Walked through the auth middleware clearly — evident mastery.',                                                                                      dot: 'var(--green)' },
      { date: 'May 20', text: 'Explained the DB schema and relations accurately without prompting.',                                                                                dot: 'var(--green)' },
    ],
  },
  {
    id: 'efua', name: 'Efua Boateng', email: 'efua.boateng@amalitech.org',
    done: 4, grade: 'Distinction', avg: 93, flagged: false, bg: '#E3F4EB', fg: '#15824E',
    trajectory: [
      { lab: 'RESTful Task Tracker',    attempt: 1, score: 94, grade: 'Distinction', date: 'May 11' },
      { lab: 'Task Tracker — Database', attempt: 1, score: 91, grade: 'Distinction', date: 'May 19' },
      { lab: 'Task Tracker with Auth',  attempt: 1, score: 95, grade: 'Distinction', date: 'Jun 2' },
      { lab: 'Media Library API',       attempt: 1, score: 93, grade: 'Distinction', date: 'Jun 12' },
    ],
    strengths: ['Exceptional error handling patterns', 'Clean layered architecture', 'Outstanding documentation'],
    gaps: ['Could push further on performance', 'Minor: stream handling in uploads'],
    authorship: [
      { date: 'Jun 12', text: 'Explained the layered architecture and every design decision unprompted — clearly her own work.', dot: 'var(--green)' },
      { date: 'Jun 2',  text: 'Could describe every JWT claim and why it was included. Impressive depth.',                        dot: 'var(--green)' },
      { date: 'May 19', text: 'Walked through the schema migrations and explained the trade-offs clearly.',                        dot: 'var(--green)' },
    ],
  },
  {
    id: 'yaw', name: 'Yaw Darko', email: 'yaw.darko@amalitech.org',
    done: 3, grade: 'Needs Work', avg: 72, flagged: true, bg: '#FBE6E6', fg: '#C23838',
    trajectory: [
      { lab: 'RESTful Task Tracker',    attempt: 1, score: 75, grade: 'Needs Work', date: 'May 14' },
      { lab: 'Task Tracker — Database', attempt: 1, score: 71, grade: 'Needs Work', date: 'May 22' },
      { lab: 'Task Tracker with Auth',  attempt: 1, score: 70, grade: 'Needs Work', date: 'Jun 5' },
    ],
    strengths: ['Routes are correctly structured', 'Consistent use of async/await'],
    gaps: ['Error handling incomplete across all labs', 'Authorship questions on wrapAsync', 'No centralised middleware'],
    authorship: [
      { date: 'Jun 5',  text: 'Could not explain the wrapAsync utility he submitted. Flagged — follow-up required.', dot: 'var(--amber)' },
      { date: 'May 22', text: 'Struggled to trace the null-pointer path through the controller live.',                dot: 'var(--amber)' },
      { date: 'May 14', text: 'Explained the route structure adequately; shaky on middleware order.',                 dot: 'var(--amber)' },
    ],
  },
  {
    id: 'adwoa', name: 'Adwoa Asante', email: 'adwoa.asante@amalitech.org',
    done: 5, grade: 'Merit', avg: 85, flagged: false, bg: '#EFE9FB', fg: '#6B46C1',
    trajectory: [
      { lab: 'RESTful Task Tracker',    attempt: 1, score: 84, grade: 'Merit',       date: 'May 13' },
      { lab: 'Task Tracker — Database', attempt: 1, score: 82, grade: 'Merit',       date: 'May 21' },
      { lab: 'Task Tracker with Auth',  attempt: 1, score: 88, grade: 'Merit',       date: 'Jun 4' },
      { lab: 'Media Library API',       attempt: 1, score: 85, grade: 'Merit',       date: 'Jun 13' },
      { lab: 'Media Library — Uploads', attempt: 1, score: 87, grade: 'Merit',       date: 'Jul 2' },
    ],
    strengths: ['Solid grasp of MVC pattern', 'Consistent code style', 'Good commit hygiene'],
    gaps: ['Role-based access control needs depth', 'Streaming file handling edge cases'],
    authorship: [
      { date: 'Jun 13', text: 'Explained the pagination logic and query params clearly — genuine understanding.', dot: 'var(--green)' },
      { date: 'Jun 4',  text: 'Described the RBAC middleware flow accurately end-to-end.',                        dot: 'var(--green)' },
    ],
  },
  {
    id: 'kojo', name: 'Kojo Owusu', email: 'kojo.owusu@amalitech.org',
    done: 4, grade: 'Pass', avg: 80, flagged: false, bg: '#FBF0DA', fg: '#9A6B0C',
    trajectory: [
      { lab: 'RESTful Task Tracker',    attempt: 1, score: 80, grade: 'Pass',  date: 'May 15' },
      { lab: 'Task Tracker — Database', attempt: 1, score: 78, grade: 'Needs Work', date: 'May 22' },
      { lab: 'Task Tracker — Database', attempt: 2, score: 80, grade: 'Pass',  date: 'May 28', cap: true },
      { lab: 'Task Tracker with Auth',  attempt: 1, score: 82, grade: 'Merit', date: 'Jun 6' },
    ],
    strengths: ['Reliable route structure', 'Correctly wired middleware', 'Good env variable discipline'],
    gaps: ['Error responses inconsistent under edge cases', 'Could improve test coverage'],
    authorship: [
      { date: 'Jun 6',  text: 'Explained the auth middleware and token expiry logic clearly.',                dot: 'var(--green)' },
      { date: 'May 28', text: 'Traced the null-pointer fix from the redo accurately — clearly his own fix.', dot: 'var(--green)' },
    ],
  },
  {
    id: 'nana', name: 'Nana Akua Frimpong', email: 'nana.frimpong@amalitech.org',
    done: 2, grade: 'Needs Work', avg: 68, flagged: true, bg: '#E6F2F2', fg: '#0E7C7B',
    trajectory: [
      { lab: 'RESTful Task Tracker',    attempt: 1, score: 70, grade: 'Needs Work', date: 'May 16' },
      { lab: 'Task Tracker — Database', attempt: 1, score: 66, grade: 'Needs Work', date: 'May 24' },
    ],
    strengths: ['Project scaffolding is clean', 'Route naming follows REST conventions'],
    gaps: ['Error handling missing from most routes', 'DB schema lacks constraints', 'Could not explain process.exit(1)'],
    authorship: [
      { date: 'May 24', text: 'Could not explain the wrapAsync helper or process.exit(1) during the live session. Escalated.', dot: 'var(--amber)' },
      { date: 'May 16', text: 'Route structure explained adequately, but stumbled on why validation runs before the handler.',  dot: 'var(--amber)' },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function gradeMeta(g: string): { bg: string; fg: string } {
  if (g === 'Distinction') return { bg: 'var(--green-t)', fg: 'var(--green-d)' };
  if (g === 'Merit')       return { bg: 'var(--blue-t)',  fg: 'var(--blue)' };
  if (g === 'Pass')        return { bg: 'var(--orange-t)', fg: 'var(--orange-d)' };
  if (g === 'New')         return { bg: 'var(--line2)',   fg: 'var(--ink2)' };
  return                          { bg: 'var(--amber-t)', fg: 'var(--amber)' };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ScoreBar({ traj }: { traj: TrajEntry[] }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '20px 22px', marginTop: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Score progression</h2>
        <span style={{ fontSize: 11, color: 'var(--ink3)' }}>dashed line = 80% pass threshold</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, padding: '6px 4px 0' }}>
        {traj.map((t, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--ink)' }}>{t.score}</span>
            <div style={{ position: 'relative', width: '100%', maxWidth: 48, height: 120, background: 'var(--line2)', borderRadius: 6, overflow: 'hidden' }}>
              {/* 80% dashed threshold line */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, borderTop: '1px dashed var(--ink3)', opacity: 0.55, zIndex: 1 }} />
              {/* Score bar */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: '6px 6px 0 0', background: 'linear-gradient(180deg, var(--orange), #FBA86A)', height: `${t.score}%` }} />
            </div>
            <span style={{ fontSize: 9.5, color: 'var(--ink3)', fontFamily: 'var(--mono)', textAlign: 'center' }}>{t.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabTimeline({ traj }: { traj: TrajEntry[] }) {
  const reversed = [...traj].reverse();
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line2)' }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Lab trajectory</h2>
      </div>
      <div style={{ padding: '8px 22px 18px' }}>
        {reversed.map((t, i) => {
          const gm = gradeMeta(t.grade);
          return (
            <div key={i} style={{ display: 'flex', gap: 15, padding: '14px 0', borderBottom: i < reversed.length - 1 ? '1px solid var(--line2)' : 'none' }}>
              {/* Timeline dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--orange)', border: '2.5px solid var(--orange-t2)', flexShrink: 0 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{t.lab}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{t.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink2)', background: 'var(--line2)', padding: '2px 8px', borderRadius: 5 }}>
                    Attempt {t.attempt}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--ink)' }}>{t.score}%</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: gm.bg, color: gm.fg }}>
                    {t.grade}
                  </span>
                  {t.cap && (
                    <span style={{ fontSize: 10, color: 'var(--amber)' }}>cap 80%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightCards({ learner }: { learner: LearnerProfile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Recurring strengths */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '17px 19px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-d)', letterSpacing: '.04em', marginBottom: 11 }}>RECURRING STRENGTHS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {learner.strengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--ink)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Recurring gaps */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '17px 19px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '.04em', marginBottom: 11 }}>RECURRING GAPS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {learner.gaps.map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--ink)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
              {g}
            </div>
          ))}
        </div>
      </div>

      {/* Authorship history */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '17px 19px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink2)', letterSpacing: '.04em', marginBottom: 12 }}>AUTHORSHIP HISTORY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {learner.authorship.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.dot, flexShrink: 0, marginTop: 5 }} />
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--ink3)', fontFamily: 'var(--mono)' }}>{a.date}</div>
                <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5, marginTop: 2 }}>{a.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────

export default function LearnersView() {
  const [selectedId, setSelectedId] = useState<string>(LEARNERS[0].id);
  const pl = LEARNERS.find((l) => l.id === selectedId) ?? LEARNERS[0];
  const plg = gradeMeta(pl.grade);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '258px 1fr', minHeight: '100%' }}>

      {/* ── Left: learner roster list ───────────────────────────────────── */}
      <div style={{ borderRight: '1px solid var(--line)', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '0 16px 12px', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink3)' }}>
          COHORT · NSP 2026
        </div>
        {LEARNERS.map((l) => {
          const active = l.id === selectedId;
          const gm = gradeMeta(l.grade);
          return (
            <button
              key={l.id}
              onClick={() => setSelectedId(l.id)}
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
              {/* Avatar */}
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, background: l.bg, color: l.fg }}>
                {getInitials(l.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? 'var(--ink)' : 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.name}
                  </span>
                  {l.flagged && (
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--amber)', flexShrink: 0 }}>⚑</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: 'var(--ink3)' }}>{l.done}/{6} labs</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: gm.bg, color: gm.fg }}>{l.grade}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Right: learner profile ──────────────────────────────────────── */}
      <div style={{ overflowY: 'auto', height: '100vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 70px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 21, background: pl.bg, color: pl.fg }}>
              {getInitials(pl.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', margin: 0, color: 'var(--ink)' }}>
                {pl.name}
                {pl.flagged && (
                  <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: 'var(--amber)', background: 'var(--amber-t)', padding: '3px 9px', borderRadius: 7, letterSpacing: '.03em', verticalAlign: 'middle' }}>
                    ⚑ FLAGGED
                  </span>
                )}
              </h1>
              <div style={{ fontSize: 13, color: 'var(--ink3)', fontFamily: 'var(--mono)', marginTop: 3 }}>{pl.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 22 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: 'var(--ink3)', letterSpacing: '.04em' }}>AVERAGE</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', marginTop: 2, color: 'var(--ink)' }}>
                  {pl.avg == null ? '—' : pl.avg + '%'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: 'var(--ink3)', letterSpacing: '.04em' }}>LABS DONE</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', marginTop: 2, color: 'var(--ink)' }}>
                  {pl.done}/{LABS_TOTAL}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: 'var(--ink3)', letterSpacing: '.04em' }}>LATEST</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: plg.bg, color: plg.fg }}>
                    {pl.grade}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Score progression chart */}
          <ScoreBar traj={pl.trajectory} />

          {/* Timeline + Insights grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 22, marginTop: 22, alignItems: 'start' }}>
            <LabTimeline traj={pl.trajectory} />
            <InsightCards learner={pl} />
          </div>

        </div>
      </div>
    </div>
  );
}
