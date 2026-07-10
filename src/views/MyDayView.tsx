import { getInitials, learnerColor } from '../data/learnerColors';

interface StartReviewFn {
  (learnerName: string, labName: string, attempt: string): void;
}

interface Props {
  firstName: string;
  onStartReview: StartReviewFn;
}

// Mock queue derived from our learner roster
const QUEUE = [
  { learner: 'Broderick Nana Bentil', lab: 'Task Tracker — Database', attempt: '2nd', submitted: '2 days ago', due: 'overdue' },
  { learner: 'Jude Boachie',          lab: 'Task Tracker with Auth',  attempt: '1st', submitted: 'yesterday',   due: 'today'   },
  { learner: 'Kofi Frimpong Osei',    lab: 'Media Library API',       attempt: '1st', submitted: 'today, 9:12', due: '2 days'  },
  { learner: 'Kwadjo Wusu-Ansah',     lab: 'Media Library API',       attempt: '1st', submitted: 'yesterday',   due: '2 days'  },
];

const STATS = [
  { label: 'Waiting for review', value: 4, delta: '1 overdue',   deltaColor: 'var(--orange)', sub: 'across 2 cohorts'         },
  { label: 'Overdue',            value: 1, delta: 'act now',     deltaColor: 'var(--red)',    sub: 'past the 48h review window' },
  { label: 'Drafts to send',     value: 1, delta: '',            deltaColor: '',              sub: 'graded, not yet emailed'  },
  { label: 'Flagged learners',   value: 2, delta: 'follow up',   deltaColor: 'var(--amber)',  sub: 'authorship or redo concerns' },
];

const COHORT_CARDS = [
  { name: 'NSP 2026 — Backend',  meta: 'Backend · Node.js · 7 learners · 6 labs', short: 'NSP26 · BACKEND',  chipBg: '#FFF1E8', chipFg: '#CF5310', waiting: 4, waitColor: 'var(--orange)', drafts: 1, empty: false },
  { name: 'NSP 2027 — Backend',  meta: 'Backend · Node.js · 0 learners · 6 labs', short: 'NSP27 · BACKEND',  chipBg: '#F0F2F5', chipFg: '#8A93A2', waiting: 0, waitColor: 'var(--ink3)',   drafts: 0, empty: true  },
];

function dueMeta(due: string) {
  if (due === 'overdue') return { bg: 'var(--red-t)',   fg: 'var(--red)',   label: 'Overdue'    };
  if (due === 'today')   return { bg: 'var(--amber-t)', fg: 'var(--amber)', label: 'Due today'  };
  return                        { bg: 'var(--line2)',   fg: 'var(--ink2)', label: `Due in ${due}` };
}

// lab name mapping for our form (some queue labs have em-dashes)
function normalizeLab(lab: string): string {
  return lab.replace('—', '-').replace('Task Tracker - Database', 'Task Tracker - Database');
}

export default function MyDayView({ firstName, onStartReview }: Props) {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '34px 40px 60px' }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink3)', letterSpacing: '.03em' }}>
          {dayName}, {dateStr}
        </div>
        <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-.025em', margin: '5px 0 0', color: 'var(--ink)' }}>
          {greeting}, {firstName}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '7px 0 0' }}>
          Everything waiting on you — across all 2 of your cohorts.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginTop: 26 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: '17px 18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--ink2)', fontWeight: 500 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 9 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--ink)' }}>{s.value}</div>
              {s.delta && <div style={{ fontSize: 11, fontWeight: 600, color: s.deltaColor }}>{s.delta}</div>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Cohort cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, marginTop: 22 }}>
        {COHORT_CARDS.map((c) => (
          <div key={c.name} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: '16px 18px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{c.meta}</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, letterSpacing: '.05em', padding: '3px 8px', borderRadius: 6, background: c.chipBg, color: c.chipFg, flexShrink: 0, whiteSpace: 'nowrap' }}>
                {c.short}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: c.waitColor }}>{c.waiting}</span>
                <span style={{ fontSize: 11, color: 'var(--ink2)', marginLeft: 6 }}>waiting</span>
              </div>
              <div style={{ width: 1, height: 20, background: 'var(--line)' }} />
              <div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)' }}>{c.drafts}</span>
                <span style={{ fontSize: 11, color: 'var(--ink2)', marginLeft: 6 }}>drafts</span>
              </div>
              <button
                onClick={() => onStartReview('', '', '1st')}
                style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink2)', padding: '7px 13px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                Open →
              </button>
            </div>
            {c.empty && (
              <div style={{ fontSize: 11, color: 'var(--amber)', background: 'var(--amber-t)', borderRadius: 8, padding: '7px 10px' }}>
                No learners yet — open the cohort to add your roster.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review queue */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', marginTop: 22 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Review queue</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: `All (${QUEUE.length})`, active: true },
              { label: 'NSP 2026 — Backend (4)', active: false },
              { label: 'NSP 2027 — Backend (0)', active: false },
            ].map((t) => (
              <button key={t.label} style={{ padding: '5px 11px', borderRadius: 7, border: `1px solid ${t.active ? 'var(--orange)' : 'var(--line)'}`, background: t.active ? 'var(--orange-t)' : 'var(--surface)', color: t.active ? 'var(--orange-d)' : 'var(--ink2)', fontSize: 12, fontWeight: t.active ? 600 : 500, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {QUEUE.map((q) => {
          const { bg, fg } = learnerColor(q.learner);
          const initials = getInitials(q.learner);
          const due = dueMeta(q.due);
          return (
            <div key={q.learner} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: '1px solid var(--line2)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, background: bg, color: fg }}>
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{q.learner}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, letterSpacing: '.05em', padding: '2px 7px', borderRadius: 5, background: '#FFF1E8', color: '#CF5310' }}>NSP26 · BACKEND</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink2)', marginTop: 2 }}>
                  {q.lab} · {q.attempt === '2nd' ? '2nd attempt (redo)' : '1st attempt'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: due.bg, color: due.fg }}>
                  {due.label}
                </span>
                <div style={{ fontSize: 10.5, color: 'var(--ink3)', marginTop: 4 }}>submitted {q.submitted}</div>
              </div>
              <button
                onClick={() => onStartReview(q.learner, normalizeLab(q.lab), q.attempt)}
                style={{ flexShrink: 0, background: 'var(--orange)', color: '#fff', border: 'none', padding: '9px 15px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 2px 8px rgba(242,107,33,.25)' }}
              >
                Review →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
