import { S } from "../styles/formStyles";

export default function ReviewerNotesCard({ reviewerNotes, setReviewerNotes }) {
  return (
    <div style={S.card}>
      <div style={S.slab}>Reviewer Session Notes</div>
      <label style={S.label}>
        Notes from the review session (verbal Q&amp;A, observations, concerns)
      </label>
      <textarea
        rows={5}
        placeholder="e.g. Learner could explain the route structure clearly but struggled to explain the wrapAsync pattern and could not define what process.exit(1) does. The auth middleware is implemented but login returns 401 inconsistently on valid credentials..."
        value={reviewerNotes}
        onChange={(e) => setReviewerNotes(e.target.value)}
        style={{
          ...S.input,
          minHeight: 110,
          resize: "vertical",
          lineHeight: 1.6,
          fontSize: 13,
        }}
      />
      <p
        style={{
          fontSize: 11,
          color: "#475569",
          marginTop: 6,
          lineHeight: 1.5,
        }}
      >
        These notes feed directly into the AI analysis. The more specific you are, the better the generated comments.
        Flag any authorship concerns here and they will appear in &quot;Other Remarks&quot;.
      </p>
    </div>
  );
}
