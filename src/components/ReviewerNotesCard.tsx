import { S } from '../styles/formStyles';

interface Props {
  reviewerNotes: string;
  setReviewerNotes: (v: string) => void;
}

export default function ReviewerNotesCard({ reviewerNotes, setReviewerNotes }: Props) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.cardTitle}>Reviewer Session Notes</span>
      </div>
      <div style={S.cardBody}>
        <label style={S.label}>Notes from the review session (verbal Q&amp;A, observations, concerns)</label>
        <textarea
          rows={5}
          placeholder="e.g. Learner could explain the route structure clearly but struggled to explain the wrapAsync pattern…"
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
          style={{ ...S.input, minHeight: 110, resize: 'vertical', lineHeight: 1.6, fontSize: 13 }}
        />
        <p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 6, lineHeight: 1.5 }}>
          These notes feed directly into the AI analysis. Flag authorship concerns here and they will appear in &quot;Other Remarks&quot;.
        </p>
      </div>
    </div>
  );
}
