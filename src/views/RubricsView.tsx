import { useState, useCallback } from 'react';
import { getInitials } from '../data/learnerColors';

// ── Types ──────────────────────────────────────────────────────────────────

interface Criterion { id: string; name: string; w: number; }
interface Rubric    { id: string; name: string; owner: string; track: string; criteria: Criterion[]; usedBy: string[]; }

// ── Seed data ──────────────────────────────────────────────────────────────

const SEED_RUBRICS: Rubric[] = [
  {
    id: 'rest-api',
    name: 'Node.js REST API',
    owner: 'Yakubu Lute',
    track: 'Backend · Node.js',
    usedBy: ['NSP 2026 — Backend', 'NSP 2027 — Backend'],
    criteria: [
      { id: 'setup',   name: 'Project Setup',           w: 10 },
      { id: 'routing', name: 'Routing & Parameters',     w: 20 },
      { id: 'mw',      name: 'Middleware Usage',         w: 15 },
      { id: 'err',     name: 'Error Handling',           w: 15 },
      { id: 'mvc',     name: 'MVC Structure',            w: 15 },
      { id: 'resp',    name: 'Response Format',          w: 10 },
      { id: 'quality', name: 'Code Quality & Clarity',  w: 15 },
    ],
  },
  {
    id: 'cicd',
    name: 'CI/CD Pipeline',
    owner: 'Prince Mensah',
    track: 'DevOps',
    usedBy: ['NSP 2026 — DevOps'],
    criteria: [
      { id: 'docker',  name: 'Dockerfile & Image Hygiene',  w: 20 },
      { id: 'ci',      name: 'CI Workflow Structure',        w: 20 },
      { id: 'test',    name: 'Automated Test Gate',          w: 15 },
      { id: 'deploy',  name: 'Deploy Stage & Rollback',      w: 20 },
      { id: 'secrets', name: 'Secrets & Config Management',  w: 15 },
      { id: 'docs',    name: 'Pipeline Documentation',       w: 10 },
    ],
  },
];

// ── Main view ──────────────────────────────────────────────────────────────

export default function RubricsView() {
  const [rubrics, setRubrics]     = useState<Rubric[]>(SEED_RUBRICS);
  const [selectedId, setSelectedId] = useState<string>(SEED_RUBRICS[0].id);
  const [savedId, setSavedId]     = useState<string | null>(null);

  const sel = rubrics.find((r) => r.id === selectedId) ?? rubrics[0];

  // ── Mutations ────────────────────────────────────────────────────────────

  const updateRubric = useCallback((id: string, fn: (r: Rubric) => Rubric) => {
    setRubrics((rs) => rs.map((r) => r.id === id ? fn({ ...r, criteria: r.criteria.map((c) => ({ ...c })) }) : r));
  }, []);

  function setName(value: string) {
    updateRubric(sel.id, (r) => ({ ...r, name: value }));
  }

  function setCritName(idx: number, value: string) {
    updateRubric(sel.id, (r) => { r.criteria[idx].name = value; return r; });
  }

  function setCritWeight(idx: number, value: string) {
    updateRubric(sel.id, (r) => { r.criteria[idx].w = value === '' ? 0 : parseFloat(value) || 0; return r; });
  }

  function removeCrit(idx: number) {
    if (sel.criteria.length <= 1) return;
    updateRubric(sel.id, (r) => { r.criteria.splice(idx, 1); return r; });
  }

  function addCrit() {
    updateRubric(sel.id, (r) => {
      r.criteria.push({ id: 'c' + Date.now(), name: 'New criterion', w: 0 });
      return r;
    });
  }

  function saveRubric() {
    setSavedId(sel.id);
    setTimeout(() => setSavedId(null), 2200);
  }

  function newRubric() {
    const id = 'r' + Date.now();
    const r: Rubric = {
      id, name: 'Untitled rubric', owner: 'Yakubu Lute',
      track: 'Backend · Node.js', usedBy: [],
      criteria: [{ id: id + 'c1', name: 'New criterion', w: 100 }],
    };
    setRubrics((rs) => [...rs, r]);
    setSelectedId(id);
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const totalWeight = sel.criteria.reduce((a, c) => a + (c.w || 0), 0);
  const twOk        = Math.round(totalWeight * 10) / 10 === 100;
  const twDisplay   = Math.round(totalWeight * 10) / 10;

  const usedByText = sel.usedBy.length
    ? 'Used by ' + sel.usedBy.length + ' cohort' + (sel.usedBy.length === 1 ? '' : 's')
    : 'Not assigned yet';

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 40px 70px' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', margin: 0, color: 'var(--ink)' }}>Rubrics</h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink2)', margin: '6px 0 0' }}>
            Every instructor keeps their own saved rubrics. Criterion weights must total 100%.
          </p>
        </div>
        <button
          onClick={newRubric}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--orange)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 10px rgba(242,107,33,.32)', fontFamily: 'var(--sans)' }}
        >
          <span style={{ fontSize: 17, lineHeight: 1, marginTop: -1 }}>+</span> New rubric
        </button>
      </div>

      {/* ── Two-column grid ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22, marginTop: 24, alignItems: 'start' }}>

        {/* LEFT · Saved rubrics list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', padding: '0 2px' }}>
            SAVED RUBRICS
          </div>

          {rubrics.map((r) => {
            const tw = Math.round(r.criteria.reduce((a, c) => a + (c.w || 0), 0) * 10) / 10;
            const twOkCard = tw === 100;
            const isSelected = r.id === selectedId;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                style={{
                  background: isSelected ? '#FFFDFB' : 'var(--surface)',
                  border: `1px solid ${isSelected ? 'var(--orange)' : 'var(--line)'}`,
                  borderRadius: 13, padding: '15px 17px', cursor: 'pointer',
                  boxShadow: 'var(--shadow)', transition: 'border-color .12s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink)' }}>
                    {r.name}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)', padding: '3px 8px', borderRadius: 6, flexShrink: 0, background: twOkCard ? 'var(--green-t)' : 'var(--amber-t)', color: twOkCard ? 'var(--green-d)' : 'var(--amber)' }}>
                    {tw}%
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 5 }}>
                  {r.criteria.length} criteria · {r.track}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: '#15181D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 8.5 }}>
                      {getInitials(r.owner)}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--ink2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.owner}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--ink3)', whiteSpace: 'nowrap' }}>
                    {r.usedBy.length ? 'Used by ' + r.usedBy.length + ' cohort' + (r.usedBy.length === 1 ? '' : 's') : 'Not assigned yet'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT · Editor */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>

          {/* Editor header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                value={sel.name}
                onChange={(e) => setName(e.target.value)}
                style={{ fontSize: 16, fontWeight: 700, border: 'none', outline: 'none', width: '100%', color: 'var(--ink)', background: 'transparent', padding: 0, fontFamily: 'var(--sans)' }}
              />
              <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 3 }}>
                By {sel.owner} · Used by: {usedByText}
              </div>
            </div>
            {savedId === sel.id && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-d)', background: 'var(--green-t)', padding: '5px 11px', borderRadius: 7, flexShrink: 0 }}>
                ✓ Saved
              </span>
            )}
            <button
              onClick={saveRubric}
              style={{ background: '#15181D', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'var(--sans)' }}
            >
              Save rubric
            </button>
          </div>

          {/* Column headers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px', borderBottom: '1px solid var(--line2)', background: '#FAFAFB' }}>
            <span style={{ width: 26, flexShrink: 0, fontSize: 9.5, fontWeight: 700, color: 'var(--ink3)', fontFamily: 'var(--mono)' }}>#</span>
            <span style={{ flex: 1, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)' }}>CRITERION</span>
            <span style={{ width: 96, flexShrink: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', textAlign: 'right' }}>WEIGHT</span>
            <span style={{ width: 28, flexShrink: 0 }} />
          </div>

          {/* Criteria rows */}
          {sel.criteria.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--line2)' }}>
              {/* Row number */}
              <span style={{ width: 26, flexShrink: 0, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--ink3)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Name input — ghost border that reveals on hover/focus */}
              <input
                value={c.name}
                onChange={(e) => setCritName(i, e.target.value)}
                style={{ flex: 1, minWidth: 0, border: '1px solid transparent', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', outline: 'none', background: 'transparent', fontFamily: 'var(--sans)', transition: 'border-color .12s, background .12s' }}
                onMouseEnter={(e) => { const el = e.currentTarget; if (document.activeElement !== el) { el.style.borderColor = 'var(--line)'; el.style.background = '#fff'; } }}
                onMouseLeave={(e) => { const el = e.currentTarget; if (document.activeElement !== el) { el.style.borderColor = 'transparent'; el.style.background = 'transparent'; } }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.background = '#fff'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
              />

              {/* Weight input */}
              <div style={{ width: 96, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                <input
                  type="number" min={0} max={100}
                  value={c.w}
                  onChange={(e) => setCritWeight(i, e.target.value)}
                  style={{ width: 58, textAlign: 'right', border: '1px solid var(--line)', borderRadius: 8, padding: '7px 9px', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--ink)', outline: 'none' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                />
                <span style={{ fontSize: 11, color: 'var(--ink3)' }}>%</span>
              </div>

              {/* Remove button */}
              <div style={{ width: 28, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                {sel.criteria.length > 1 && (
                  <button
                    onClick={() => removeCrit(i)}
                    title="Remove criterion"
                    style={{ width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: 7, fontSize: 14, color: 'var(--ink3)', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .1s, color .1s' }}
                    onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = 'var(--red-t)'; el.style.color = 'var(--red)'; }}
                    onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = 'var(--ink3)'; }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '13px 20px', background: '#FAFAFB' }}>
            <button
              onClick={addCrit}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink2)', padding: '9px 15px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
            >
              + Add criterion
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: twOk ? 'var(--green-d)' : 'var(--amber)' }}>
              Total weight: {twDisplay}%
              {!twOk && (
                <>
                  <span style={{ fontWeight: 500, color: 'var(--amber)' }}>— must equal 100%</span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
