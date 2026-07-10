import { LEARNERS, EMMANUEL_EMAIL } from '../data/learners';
import { S } from '../styles/formStyles';

interface Props {
  learnerName: string;
  learnerEmail: string;
  handleLearnerSelect: (name: string) => void;
}

export default function LearnerCard({ learnerName, learnerEmail, handleLearnerSelect }: Props) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.cardTitle}>Learner</span>
      </div>
      <div style={{ ...S.cardBody }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={S.label}>Select Learner</label>
            <select
              value={learnerName}
              onChange={(e) => handleLearnerSelect(e.target.value)}
              style={{ ...S.input, cursor: 'pointer', color: learnerName ? 'var(--ink)' : 'var(--ink3)' }}
            >
              <option value="">— Choose a learner —</option>
              {LEARNERS.map((l) => <option key={l.email} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Learner Email</label>
            <input
              type="text"
              value={learnerEmail}
              readOnly
              placeholder="Auto-filled on learner select"
              style={{ ...S.input, color: learnerEmail ? 'var(--ai-d)' : 'var(--ink3)', background: learnerEmail ? 'var(--ai-t)' : 'var(--surface)', cursor: 'default' }}
            />
          </div>
        </div>
        <div style={{ padding: '8px 12px', background: 'var(--line2)', border: '1px solid var(--line)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--ink3)' }}>CC on every email:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>{EMMANUEL_EMAIL}</span>
        </div>
      </div>
    </div>
  );
}
