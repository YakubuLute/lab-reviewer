import type { Lab } from '../../shared/types';
import { LAB_DATA } from '../data/labs';
import { S } from '../styles/formStyles';

interface Props {
  selectedLab: string;
  setSelectedLab: (v: string) => void;
  attempt: string;
  setAttempt: (v: string) => void;
  lab: Lab | null;
}

export default function LabAttemptCard({ selectedLab, setSelectedLab, attempt, setAttempt, lab }: Props) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.cardTitle}>Lab &amp; Attempt</span>
      </div>
      <div style={S.cardBody}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 10 }}>
          <div>
            <label style={S.label}>Lab Module</label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              style={{ ...S.input, cursor: 'pointer', color: selectedLab ? 'var(--ink)' : 'var(--ink3)' }}
            >
              <option value="">— Choose a lab —</option>
              {Object.keys(LAB_DATA).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Attempt</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['1st', '2nd'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAttempt(a)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 9, fontFamily: 'var(--sans)',
                    fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                    border: attempt === a ? '1.5px solid var(--orange)' : '1px solid var(--line)',
                    background: attempt === a ? 'var(--orange-t)' : 'var(--surface)',
                    color: attempt === a ? 'var(--orange-d)' : 'var(--ink2)',
                    fontWeight: attempt === a ? 700 : 500,
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {attempt === '2nd' && (
          <div style={{ padding: '9px 12px', background: 'var(--amber-t)', border: '1px solid rgba(217,138,11,.2)', borderRadius: 9, fontSize: 12, color: 'var(--amber)', marginBottom: 8 }}>
            2nd attempt — weights scaled to 80%. Maximum achievable score is <strong>80</strong>.
          </div>
        )}
        {lab && (
          <div style={{ padding: '9px 12px', background: 'var(--line2)', borderRadius: 9, fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.5 }}>
            {lab.description}
          </div>
        )}
      </div>
    </div>
  );
}
