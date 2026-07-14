import { useState } from 'react';
import { getInitials } from '../data/learnerColors';
import type { Cohort } from '../data/cohorts';
import AddLearnerModal from '../components/AddLearnerModal';

interface Props {
  cohort: Cohort;
  firstName: string;
  onNewReview: () => void;
  onAddLearner: (name: string, email?: string) => Promise<void>;
  onBulkAddLearners: (csv: string) => Promise<number>;
  onRemoveLearner: (learnerId: string) => void;
  onAddLab: (name: string, due: string) => void;
  onUpdateLabDue: (labId: string, due: string) => void;
  onRemoveLab: (labId: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function gradeMeta(g: string): { bg: string; fg: string } {
  if (g === 'Distinction') return { bg: 'var(--green-t)', fg: 'var(--green-d)' };
  if (g === 'Merit')       return { bg: 'var(--blue-t)',  fg: 'var(--blue)' };
  if (g === 'Pass')        return { bg: 'var(--orange-t)', fg: 'var(--orange-d)' };
  if (g === 'New')         return { bg: 'var(--line2)', fg: 'var(--ink2)' };
  return                          { bg: 'var(--amber-t)', fg: 'var(--amber)' };
}

function labDueMeta(due: string): { bg: string; fg: string; label: string } {
  if (!due) return { bg: 'var(--line2)', fg: 'var(--ink3)', label: 'No deadline' };
  const d = new Date(due + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0)  return { bg: 'var(--line2)',   fg: 'var(--ink2)',    label: 'Closed ' + fmt };
  if (diff === 0) return { bg: 'var(--red-t)',   fg: 'var(--red)',     label: 'Due today' };
  if (diff <= 3) return { bg: 'var(--amber-t)', fg: 'var(--amber)',   label: 'Due ' + fmt };
  return               { bg: 'var(--green-t)', fg: 'var(--green-d)', label: 'Due ' + fmt };
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CohortDashboardView({
  cohort, firstName, onNewReview,
  onAddLearner, onBulkAddLearners, onRemoveLearner,
  onAddLab, onUpdateLabDue, onRemoveLab,
}: Props) {
  const { learners, labs, name: cohortName, track } = cohort;

  // add learner modal
  const [addLearnerOpen, setAddLearnerOpen] = useState(false);

  // add lab form
  const [addLabOpen, setAddLabOpen] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabDue,  setNewLabDue]  = useState('');

  // ── Computed stats ────────────────────────────────────────────────────────
  const withAvg = learners.filter((l) => l.avg != null);
  const passCount = withAvg.filter((l) => l.grade !== 'Needs Work' && l.grade !== 'New').length;
  const cohortAvg = withAvg.length
    ? Math.round(withAvg.reduce((a, l) => a + (l.avg as number), 0) / withAvg.length) + '%'
    : '—';
  const passRate = withAvg.length
    ? Math.round((passCount / withAvg.length) * 100) + '%'
    : '—';
  const flaggedN = learners.filter((l) => l.flagged).length;

  const STATS = [
    { label: 'Cohort average',    value: cohortAvg, delta: withAvg.length ? '+3' : '', deltaColor: 'var(--green)', sub: 'vs. last lab' },
    { label: 'Pass rate',         value: passRate,  delta: withAvg.length ? `${passCount}/${withAvg.length}` : '', deltaColor: 'var(--ink3)', sub: 'at or above 80%' },
    { label: 'Flagged',           value: String(flaggedN), delta: flaggedN ? 'review' : '', deltaColor: 'var(--amber)', sub: 'authorship concerns' },
    { label: 'Learners',          value: String(learners.length), delta: '', deltaColor: 'var(--ink3)', sub: `across ${labs.length} lab${labs.length === 1 ? '' : 's'}` },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleAddLab() {
    const name = newLabName.trim();
    if (!name) return;
    onAddLab(name, newLabDue);
    setNewLabName(''); setNewLabDue(''); setAddLabOpen(false);
  }

  // ── Date header ───────────────────────────────────────────────────────────
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const cohortSub = `${track} · ${cohortName} · ${learners.length} learner${learners.length === 1 ? '' : 's'} · ${labs.length} lab${labs.length === 1 ? '' : 's'}`;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '34px 40px 60px' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink3)', letterSpacing: '.03em' }}>
            {dayName}, {dateStr}
          </div>
          <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-.025em', margin: '5px 0 0', color: 'var(--ink)' }}>
            {greeting}, {firstName}
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

      {/* ── Roster + Empty state ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 22, marginTop: 24, alignItems: 'start' }}>

        {/* Cohort roster */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Cohort roster</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 10.5, color: 'var(--ink3)', fontFamily: 'var(--mono)', letterSpacing: '.02em' }}>LAB PROGRESS · LATEST GRADE</span>
              <button
                onClick={() => setAddLearnerOpen(true)}
                style={{ background: 'var(--orange-t)', color: 'var(--orange-d)', border: '1px solid var(--orange-t2)', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                + Add learner
              </button>
            </div>
          </div>

          {addLearnerOpen && (
            <AddLearnerModal
              cohortName={cohortName}
              cohortTrack={track}
              onAdd={onAddLearner}
              onBulkAdd={onBulkAddLearners}
              onClose={() => setAddLearnerOpen(false)}
            />
          )}

          {learners.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>No learners yet</div>
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
              const total = labs.length || 1;
              const pct = Math.round((L.done / total) * 100);
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
                      <span>{L.done}/{total} labs</span>
                      <span style={{ fontFamily: 'var(--mono)' }}>{L.avg == null ? 'new' : 'avg ' + L.avg}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: 'var(--orange)', borderRadius: 3 }} />
                    </div>
                  </div>

                  {/* Grade chip */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, background: gm.bg, color: gm.fg }}>
                      {L.grade}
                    </span>
                    <button
                      title="Remove learner"
                      onClick={(e) => { e.stopPropagation(); onRemoveLearner(L.id); }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 14, lineHeight: 1, padding: '2px 4px', borderRadius: 5, opacity: 0 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info card when no labs / empty state */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>Cohort info</h2>
          </div>
          <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Track */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--mono)', letterSpacing: '.05em', marginBottom: 4 }}>TRACK</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{track}</div>
            </div>
            {/* Stats summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 3 }}>Learners</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{learners.length}</div>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 3 }}>Labs</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{labs.length}</div>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 3 }}>Cohort avg.</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{cohortAvg}</div>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 3 }}>Pass rate</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{passRate}</div>
              </div>
            </div>
            <button
              onClick={onNewReview}
              style={{ width: '100%', background: 'var(--orange-t)', color: 'var(--orange-d)', border: '1px solid var(--orange-t2)', padding: '11px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
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
                style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', fontSize: 12.5, outline: 'none', fontFamily: 'var(--sans)', color: 'var(--ink)', boxSizing: 'border-box' }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLab()}
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

        {labs.length === 0 ? (
          <div style={{ padding: '28px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 10 }}>No labs added yet.</div>
            <button
              onClick={() => setAddLabOpen(true)}
              style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
            >
              + Add first lab
            </button>
          </div>
        ) : (
          labs.map((l, i) => {
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
                  onChange={(e) => onUpdateLabDue(l.id, e.target.value)}
                  style={{ flexShrink: 0, border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink)', outline: 'none', background: '#fff' }}
                />
                <button
                  title="Remove lab"
                  onClick={() => onRemoveLab(l.id)}
                  style={{ flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 14, lineHeight: 1, padding: '4px 6px', borderRadius: 6 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.background = 'var(--red-t)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
