import { useState } from 'react';
import { getInitials } from '../data/learnerColors';

interface Props {
  onNewReview: () => void;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface Learner {
  id: string; name: string; email: string;
  done: number; grade: string; avg: number | null;
  flagged: boolean; bg: string; fg: string;
}

interface RecentReview {
  learner: string; lab: string; grade: string;
  status: 'sent' | 'draft'; when: string;
}

interface Lab {
  id: string; name: string; due: string;
}

// ── Seed data ──────────────────────────────────────────────────────────────

const COHORT = {
  name: 'NSP 2026 — Backend',
  track: 'Backend · Node.js',
  labsTotal: 6,
};

const LEARNERS_SEED: Learner[] = [
  { id: 'ama',   name: 'Ama Osei',          email: 'ama.osei@amalitech.org',       done: 4, grade: 'Pass',        avg: 81,  flagged: false, bg: '#FCE7D8', fg: '#C2530B' },
  { id: 'kwame', name: 'Kwame Mensah',       email: 'kwame.mensah@amalitech.org',   done: 5, grade: 'Merit',       avg: 87,  flagged: false, bg: '#E2ECFB', fg: '#2A57C9' },
  { id: 'efua',  name: 'Efua Boateng',       email: 'efua.boateng@amalitech.org',   done: 4, grade: 'Distinction', avg: 93,  flagged: false, bg: '#E3F4EB', fg: '#15824E' },
  { id: 'yaw',   name: 'Yaw Darko',          email: 'yaw.darko@amalitech.org',      done: 3, grade: 'Needs Work',  avg: 72,  flagged: true,  bg: '#FBE6E6', fg: '#C23838' },
  { id: 'adwoa', name: 'Adwoa Asante',       email: 'adwoa.asante@amalitech.org',   done: 5, grade: 'Merit',       avg: 85,  flagged: false, bg: '#EFE9FB', fg: '#6B46C1' },
  { id: 'kojo',  name: 'Kojo Owusu',         email: 'kojo.owusu@amalitech.org',     done: 4, grade: 'Pass',        avg: 80,  flagged: false, bg: '#FBF0DA', fg: '#9A6B0C' },
  { id: 'nana',  name: 'Nana Akua Frimpong', email: 'nana.frimpong@amalitech.org',  done: 2, grade: 'Needs Work',  avg: 68,  flagged: true,  bg: '#E6F2F2', fg: '#0E7C7B' },
];

const RECENT_SEED: RecentReview[] = [
  { learner: 'Efua Boateng', lab: 'Media Library API',          grade: 'Distinction', status: 'sent',  when: '2h ago'   },
  { learner: 'Kwame Mensah', lab: 'Task Tracker with Auth',     grade: 'Merit',       status: 'sent',  when: '5h ago'   },
  { learner: 'Ama Osei',     lab: 'RESTful Task Tracker',       grade: 'Pass',        status: 'draft', when: 'Yesterday' },
  { learner: 'Yaw Darko',    lab: 'Task Tracker — Database',    grade: 'Needs Work',  status: 'sent',  when: 'Yesterday' },
];

const LABS_SEED: Lab[] = [
  { id: 'b1', name: 'RESTful Task Tracker',               due: '2026-05-15' },
  { id: 'b2', name: 'Task Tracker — Database',            due: '2026-05-22' },
  { id: 'b3', name: 'Task Tracker with Auth',             due: '2026-06-05' },
  { id: 'b4', name: 'Media Library API',                  due: '2026-06-14' },
  { id: 'b5', name: 'Media Library — Uploads & Streaming',due: '2026-07-01' },
  { id: 'b6', name: 'Capstone: Production API',           due: '2026-07-15' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function gradeMeta(g: string): { bg: string; fg: string } {
  if (g === 'Distinction') return { bg: 'var(--green-t)', fg: 'var(--green-d)' };
  if (g === 'Merit')       return { bg: 'var(--blue-t)',  fg: 'var(--blue)' };
  if (g === 'Pass')        return { bg: 'var(--orange-t)', fg: 'var(--orange-d)' };
  if (g === 'New')         return { bg: 'var(--line2)', fg: 'var(--ink2)' };
  return                          { bg: 'var(--amber-t)', fg: 'var(--amber)' };
}

const AVATAR_PALETTE = [
  ['#FCE7D8', '#C2530B'], ['#E2ECFB', '#2A57C9'], ['#E3F4EB', '#15824E'],
  ['#EFE9FB', '#6B46C1'], ['#FBF0DA', '#9A6B0C'], ['#E6F2F2', '#0E7C7B'],
];

function labDueMeta(due: string): { bg: string; fg: string; label: string } {
  if (!due) return { bg: 'var(--line2)', fg: 'var(--ink3)', label: 'No deadline set' };
  const d = new Date(due + 'T00:00:00');
  const today = new Date(2026, 6, 10); // demo date matches project context
  const fmt = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0)  return { bg: 'var(--line2)',   fg: 'var(--ink2)',  label: 'Closed ' + fmt };
  if (diff <= 3) return { bg: 'var(--amber-t)', fg: 'var(--amber)', label: 'Due ' + fmt };
  return               { bg: 'var(--green-t)', fg: 'var(--green-d)', label: 'Due ' + fmt };
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CohortDashboardView({ onNewReview }: Props) {
  const [learners, setLearners] = useState<Learner[]>(LEARNERS_SEED);
  const [labs, setLabs] = useState<Lab[]>(LABS_SEED);

  // add learner form
  const [addLearnerOpen, setAddLearnerOpen] = useState(false);
  const [newName, setNewName]   = useState('');
  const [newEmail, setNewEmail] = useState('');

  // add lab form
  const [addLabOpen, setAddLabOpen] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabDue,  setNewLabDue]  = useState('');

  // ── Computed stats ────────────────────────────────────────────────────────
  const withAvg = learners.filter((l) => l.avg != null);
  const passCount = withAvg.filter((l) => l.grade !== 'Needs Work').length;
  const cohortAvg = withAvg.length
    ? Math.round(withAvg.reduce((a, l) => a + (l.avg as number), 0) / withAvg.length) + '%'
    : '—';
  const passRate = withAvg.length
    ? Math.round((passCount / withAvg.length) * 100) + '%'
    : '—';
  const flaggedN = learners.filter((l) => l.flagged).length;

  const STATS = [
    { label: 'Cohort average',    value: cohortAvg, delta: withAvg.length ? '+3' : '', deltaColor: 'var(--green)', sub: 'vs. last lab' },
    { label: 'Pass rate',         value: passRate,  delta: withAvg.length ? passCount + '/' + withAvg.length : '', deltaColor: 'var(--ink3)', sub: 'at or above 80%' },
    { label: 'Flagged',           value: String(flaggedN), delta: flaggedN ? 'review' : '', deltaColor: 'var(--amber)', sub: 'authorship concerns' },
    { label: 'Reviews this week', value: withAvg.length ? '12' : '0', delta: withAvg.length ? '~12m' : '', deltaColor: 'var(--ink3)', sub: 'avg. time each' },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleAddLearner() {
    const name = newName.trim();
    if (!name) return;
    const email = newEmail.trim() ||
      name.toLowerCase().split(/\s+/).slice(0, 2).join('.') + '@amalitech.org';
    const [bg, fg] = AVATAR_PALETTE[learners.length % AVATAR_PALETTE.length] as [string, string];
    const l: Learner = { id: 'x' + Date.now(), name, email, done: 0, grade: 'New', avg: null, flagged: false, bg, fg };
    setLearners([...learners, l]);
    setNewName(''); setNewEmail(''); setAddLearnerOpen(false);
  }

  function handleAddLab() {
    const name = newLabName.trim();
    if (!name) return;
    setLabs([...labs, { id: 'lx' + Date.now(), name, due: newLabDue }]);
    setNewLabName(''); setNewLabDue(''); setAddLabOpen(false);
  }

  function handleSetDue(id: string, value: string) {
    setLabs(labs.map((l) => l.id === id ? { ...l, due: value } : l));
  }

  // ── Date header ───────────────────────────────────────────────────────────
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const cohortSub = `${COHORT.track} · ${COHORT.name} · ${learners.length} learner${learners.length === 1 ? '' : 's'} · ${COHORT.labsTotal} labs`;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '34px 40px 60px' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink3)', letterSpacing: '.03em' }}>
            {dayName}, {dateStr}
          </div>
          <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-.025em', margin: '5px 0 0', color: 'var(--ink)' }}>
            {greeting}, Yakubu
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '7px 0 0' }}>
            {cohortSub}
          </p>
        </div>
        <button
          onClick={onNewReview}
          style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--orange)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 10px rgba(242,107,33,.32)', fontFamily: 'var(--sans)' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span> New Review
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
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

      {/* ── Roster + Recent ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 22, marginTop: 24, alignItems: 'start' }}>

        {/* Cohort roster */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Cohort roster</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 10.5, color: 'var(--ink3)', fontFamily: 'var(--mono)', letterSpacing: '.02em' }}>LAB PROGRESS · LATEST GRADE</span>
              <button
                onClick={() => { setAddLearnerOpen(!addLearnerOpen); setNewName(''); setNewEmail(''); }}
                style={{ background: 'var(--orange-t)', color: 'var(--orange-d)', border: '1px solid var(--orange-t2)', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                + Add learner
              </button>
            </div>
          </div>

          {/* Add learner form */}
          {addLearnerOpen && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '13px 20px', borderBottom: '1px solid var(--line2)', background: '#FFFDFB', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Full name</label>
                <input
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kofi Asante"
                  style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 9, padding: '8px 11px', fontSize: 12.5, fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Email (optional)</label>
                <input
                  value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="auto-generated if blank"
                  style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 9, padding: '8px 11px', fontSize: 12.5, fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none' }}
                />
              </div>
              <button
                onClick={handleAddLearner}
                style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap' }}
              >
                Add learner
              </button>
              <button
                onClick={() => setAddLearnerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink3)', fontSize: 12, cursor: 'pointer', padding: '9px 4px', fontFamily: 'var(--sans)' }}
              >
                Cancel
              </button>
            </div>
          )}

          {learners.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>No learners in this cohort yet</div>
              <p style={{ fontSize: 12, color: 'var(--ink2)', margin: '6px 0 15px' }}>Add your learners to start running lab reviews.</p>
              <button
                onClick={() => setAddLearnerOpen(true)}
                style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                + Add first learner
              </button>
            </div>
          ) : (
            learners.map((L) => {
              const gm = gradeMeta(L.grade);
              const pct = Math.round((L.done / COHORT.labsTotal) * 100);
              return (
                <div
                  key={L.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: '1px solid var(--line2)', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--line2)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, background: L.bg, color: L.fg }}>
                    {getInitials(L.name)}
                  </div>

                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L.name}</span>
                      {L.flagged && (
                        <span title="Authorship concern on file" style={{ fontSize: 9, fontWeight: 600, color: 'var(--amber)', background: 'var(--amber-t)', padding: '2px 6px', borderRadius: 5, letterSpacing: '.03em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          ⚑ FLAGGED
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{L.email}</div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: 104, flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--ink2)', marginBottom: 4 }}>
                      <span>{L.done}/{COHORT.labsTotal} labs</span>
                      <span style={{ fontFamily: 'var(--mono)' }}>{L.avg == null ? 'new' : 'avg ' + L.avg}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: 'var(--orange)', borderRadius: 3 }} />
                    </div>
                  </div>

                  {/* Grade chip */}
                  <div style={{ width: 84, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, background: gm.bg, color: gm.fg }}>
                      {L.grade}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent reviews */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Recent reviews</h2>
          </div>

          {RECENT_SEED.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 12, color: 'var(--ink3)' }}>
              No reviews in this cohort yet.
            </div>
          ) : (
            RECENT_SEED.map((r, i) => {
              const gm = gradeMeta(r.grade);
              const isSent = r.status === 'sent';
              return (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--line2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.learner}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: gm.bg, color: gm.fg }}>
                      {r.grade}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink2)', marginTop: 4 }}>{r.lab}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: isSent ? 'var(--green)' : 'var(--amber)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSent ? 'var(--green)' : 'var(--amber)', display: 'inline-block' }} />
                      {isSent ? 'Sent' : 'Draft'}
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--ink3)', fontFamily: 'var(--mono)' }}>{r.when}</span>
                  </div>
                </div>
              );
            })
          )}

          <div style={{ padding: '13px 20px' }}>
            <button
              onClick={onNewReview}
              style={{ width: '100%', background: 'var(--orange-t)', color: 'var(--orange-d)', border: '1px solid var(--orange-t2)', padding: '10px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
            >
              Start a new review →
            </button>
          </div>
        </div>
      </div>

      {/* ── Labs & deadlines ───────────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', marginTop: 22 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Labs &amp; deadlines</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 10.5, color: 'var(--ink3)', fontFamily: 'var(--mono)', letterSpacing: '.02em' }}>SUBMISSIONS CLOSE 23:59 ON THE DUE DATE</span>
            <button
              onClick={() => { setAddLabOpen(!addLabOpen); setNewLabName(''); setNewLabDue(''); }}
              style={{ background: 'var(--orange-t)', color: 'var(--orange-d)', border: '1px solid var(--orange-t2)', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
            >
              + Add lab
            </button>
          </div>
        </div>

        {/* Add lab form */}
        {addLabOpen && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--line2)', background: '#FFFDFB', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 11, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Lab name</label>
              <input
                value={newLabName} onChange={(e) => setNewLabName(e.target.value)}
                placeholder="e.g. WebSockets — Live Updates"
                style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', fontSize: 12.5, outline: 'none', fontFamily: 'var(--sans)', color: 'var(--ink)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Deadline</label>
              <input
                type="date" value={newLabDue} onChange={(e) => setNewLabDue(e.target.value)}
                style={{ border: '1px solid var(--line)', borderRadius: 9, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--mono)', outline: 'none', color: 'var(--ink)' }}
              />
            </div>
            <button
              onClick={handleAddLab}
              style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap' }}
            >
              Add lab
            </button>
            <button
              onClick={() => setAddLabOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--ink3)', fontSize: 12, cursor: 'pointer', padding: '9px 4px', fontFamily: 'var(--sans)' }}
            >
              Cancel
            </button>
          </div>
        )}

        {labs.map((l, i) => {
          const dm = labDueMeta(l.due);
          return (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', borderBottom: i < labs.length - 1 ? '1px solid var(--line2)' : 'none' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)', fontFamily: 'var(--mono)', flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink)' }}>
                {l.name}
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: dm.bg, color: dm.fg, flexShrink: 0, whiteSpace: 'nowrap' }}>
                {dm.label}
              </span>
              <input
                type="date"
                value={l.due}
                onChange={(e) => handleSetDue(l.id, e.target.value)}
                style={{ flexShrink: 0, border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink)', outline: 'none', background: '#fff' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
