import { S } from '../styles/formStyles';

interface Props {
  redoLab: boolean;
  setRedoLab: (v: boolean) => void;
  plagiarism: boolean;
  setPlagiarism: (v: boolean) => void;
}

function FlagToggle({ label, value, onChange, color }: { label: string; value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: value ? `${color}18` : 'var(--line2)',
        border: `1px solid ${value ? `${color}44` : 'var(--line)'}`,
        borderRadius: 9, cursor: 'pointer', fontFamily: 'var(--sans)', width: '100%',
        transition: 'all 0.15s', textAlign: 'left',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${value ? color : 'var(--line)'}`,
        background: value ? color : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
      }}>
        {value && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: value ? color : 'var(--ink2)' }}>{label}</span>
    </button>
  );
}

export default function FlagsCard({ redoLab, setRedoLab, plagiarism, setPlagiarism }: Props) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.cardTitle}>Flags</span>
      </div>
      <div style={{ ...S.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <FlagToggle label="Re-do Lab Required" value={redoLab} onChange={setRedoLab} color="var(--amber)" />
        <FlagToggle label="Plagiarism Flagged" value={plagiarism} onChange={setPlagiarism} color="var(--red)" />
      </div>
    </div>
  );
}
