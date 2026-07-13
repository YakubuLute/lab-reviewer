import { S } from '../styles/formStyles';

interface Props {
  learnerName: string;
  learnerEmail: string;
  learners: { name: string; email: string }[];
  handleLearnerSelect: (name: string) => void;
}

export default function LearnerCard({ learnerName, learnerEmail, learners, handleLearnerSelect }: Props) {
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
              {learners.map((l) => <option key={l.email} value={l.name}>{l.name}</option>)}
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
      </div>
    </div>
  );
}
