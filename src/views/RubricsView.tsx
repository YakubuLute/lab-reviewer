import { useState } from 'react';
import { LAB_DATA } from '../data/labs';

// Flatten LAB_DATA into a stable ordered array
const LABS = Object.entries(LAB_DATA).map(([name, lab]) => ({
  name,
  description: lab.description,
  criteria: lab.criteria,
  totalWeight: lab.criteria.reduce((s, c) => s + c.weight, 0),
}));

export default function RubricsView() {
  const [selectedName, setSelectedName] = useState<string>(LABS[0]!.name);
  const sel = LABS.find((l) => l.name === selectedName) ?? LABS[0]!;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 40px 70px' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', margin: 0, color: 'var(--ink)' }}>Rubrics</h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink2)', margin: '6px 0 0' }}>
          Scoring rubrics for all {LABS.length} labs. Criterion weights sum to 100%.
        </p>
      </div>

      {/* ── Two-column grid ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22, marginTop: 24, alignItems: 'start' }}>

        {/* LEFT · Lab list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', padding: '0 2px' }}>
            LABS
          </div>

          {LABS.map((lab) => {
            const isSelected = lab.name === selectedName;
            return (
              <div
                key={lab.name}
                onClick={() => setSelectedName(lab.name)}
                style={{
                  background: isSelected ? '#FFFDFB' : 'var(--surface)',
                  border: `1px solid ${isSelected ? 'var(--orange)' : 'var(--line)'}`,
                  borderRadius: 13, padding: '15px 17px', cursor: 'pointer',
                  boxShadow: 'var(--shadow)', transition: 'border-color .12s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 0, color: 'var(--ink)', lineHeight: 1.35 }}>
                    {lab.name}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)', padding: '3px 8px', borderRadius: 6, flexShrink: 0, background: 'var(--green-t)', color: 'var(--green-d)' }}>
                    {lab.totalWeight}%
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 5 }}>
                  {lab.criteria.length} criteria
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT · Detail */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>

          {/* Panel header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{sel.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 4, lineHeight: 1.5 }}>{sel.description}</div>
          </div>

          {/* Column headers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px', borderBottom: '1px solid var(--line2)', background: '#FAFAFB' }}>
            <span style={{ width: 26, flexShrink: 0, fontSize: 9.5, fontWeight: 700, color: 'var(--ink3)', fontFamily: 'var(--mono)' }}>#</span>
            <span style={{ flex: 1, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)' }}>CRITERION</span>
            <span style={{ flex: 2, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)' }}>DESCRIPTION</span>
            <span style={{ width: 72, flexShrink: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', textAlign: 'right' }}>WEIGHT</span>
          </div>

          {/* Criteria rows */}
          {sel.criteria.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--line2)' }}>
              <span style={{ width: 26, flexShrink: 0, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--ink3)', paddingTop: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
              </div>
              <div style={{ flex: 2, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5 }}>{c.description}</div>
              </div>
              <div style={{ width: 72, flexShrink: 0, textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{c.weight}%</span>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '13px 20px', background: '#FAFAFB' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-d)' }}>
              Total weight: {sel.totalWeight}%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
