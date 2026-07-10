import { getInitials, learnerColor } from '../data/learnerColors';
import type { Cohort } from '../data/cohorts';

interface Props {
  firstName: string;
  cohorts: Cohort[];
  onStartReview: (learnerName: string, labName: string, attempt: string) => void;
  onSelectCohort: (id: string) => void;
  onCreateCohort: () => void;
}

// Static mock review queue — will be replaced once reviews are persisted
const QUEUE = [
  { learner: 'Broderick Nana Bentil', lab: 'Task Tracker - Database', attempt: '2nd', submitted: '2 days ago', due: 'overdue' },
  { learner: 'Jude Boachie',          lab: 'Task Tracker with Auth',  attempt: '1st', submitted: 'yesterday',   due: 'today'   },
  { learner: 'Kofi Frimpong Osei',    lab: 'Media Library API',       attempt: '1st', submitted: 'today, 9:12', due: '2 days'  },
  { learner: 'Kwadjo Wusu-Ansah',     lab: 'Media Library API',       attempt: '1st', submitted: 'yesterday',   due: '2 days'  },
];

function dueMeta(due: string) {
  if (due === 'overdue') return { bg: 'var(--red-t)',   fg: 'var(--red)',   label: 'Overdue'    };
  if (due === 'today')   return { bg: 'var(--amber-t)', fg: 'var(--amber)', label: 'Due today'  };
  return                        { bg: 'var(--line2)',   fg: 'var(--ink2)', label: `Due in ${due}` };
}

export default function MyDayView({ firstName, cohorts, onStartReview, onSelectCohort, onCreateCohort }: Props) {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Compute stats across all cohorts
  const totalWaiting  = QUEUE.length;
  const totalOverdue  = QUEUE.filter((q) => q.due === 'overdue').length;
  const totalFlagged  = cohorts.reduce((a, c) => a + c.learners.filter((l) => l.flagged).length, 0);

  const STATS = [
    { label: 'Waiting for review', value: totalWaiting, delta: totalOverdue ? `${totalOverdue} overdue` : '', deltaColor: 'var(--orange)', sub: `across ${cohorts.length} cohort${cohorts.length === 1 ? '' : 's'}` },
    { label: 'Overdue',            value: totalOverdue, delta: totalOverdue ? 'act now' : '',   deltaColor: 'var(--red)',   sub: 'past the 48h review window' },
    { label: 'Drafts to send',     value: 0,            delta: '',                              deltaColor: '',             sub: 'graded, not yet emailed' },
    { label: 'Flagged learners',   value: totalFlagged, delta: totalFlagged ? 'follow up' : '', deltaColor: 'var(--amber)', sub: 'authorship or redo concerns' },
  ];

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
          Everything waiting on you — across all {cohorts.length} of your cohort{cohorts.length === 1 ? '' : 's'}.
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
      {cohorts.length === 0 ? (
        <div style={{ marginTop: 22, background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 14, padding: '36px 30px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>No cohorts yet</div>
          <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 18px', lineHeight: 1.6 }}>
            Create your first cohort to start managing learners, labs, and reviews.
          </p>
          <button
            onClick={onCreateCohort}
            style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 3px 10px rgba(242,107,33,.28)' }}
          >
            + Create cohort
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, marginTop: 22 }}>
          {cohorts.map((c) => {
            const waiting = 0; // TODO: link to real pending-review count
            const drafts  = 0;
            const isEmpty = c.learners.length === 0;
            const chipBg  = isEmpty ? '#F0F2F5' : '#FFF1E8';
            const chipFg  = isEmpty ? '#8A93A2' : '#CF5310';
            return (
              <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: '16px 18px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{c.track} · {c.learners.length} learner{c.learners.length === 1 ? '' : 's'} · {c.labs.length} lab{c.labs.length === 1 ? '' : 's'}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, letterSpacing: '.05em', padding: '3px 8px', borderRadius: 6, background: chipBg, color: chipFg, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {c.track.split(' · ')[0].toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: waiting > 0 ? 'var(--orange)' : 'var(--ink3)' }}>{waiting}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink2)', marginLeft: 6 }}>waiting</span>
                  </div>
                  <div style={{ width: 1, height: 20, background: 'var(--line)' }} />
                  <div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)' }}>{drafts}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink2)', marginLeft: 6 }}>drafts</span>
                  </div>
                  <button
                    onClick={() => onSelectCohort(c.id)}
                    style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink2)', padding: '7px 13px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                  >
                    Open →
                  </button>
                </div>
                {isEmpty && (
                  <div style={{ fontSize: 11, color: 'var(--amber)', background: 'var(--amber-t)', borderRadius: 8, padding: '7px 10px' }}>
                    No learners yet — open the cohort to add your roster.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review queue */}
      {QUEUE.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', marginTop: 22 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Review queue</h2>
            <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>Showing mock queue — live data coming soon</div>
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
                  onClick={() => onStartReview(q.learner, q.lab, q.attempt)}
                  style={{ flexShrink: 0, background: 'var(--orange)', color: '#fff', border: 'none', padding: '9px 15px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 2px 8px rgba(242,107,33,.25)' }}
                >
                  Review →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
