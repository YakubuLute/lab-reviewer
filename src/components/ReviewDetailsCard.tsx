import { S } from '../styles/formStyles';

interface Props {
  reviewerName: string;
  setReviewerName: (v: string) => void;
  reviewDate: string;
  setReviewDate: (v: string) => void;
}

export default function ReviewDetailsCard({ reviewerName, setReviewerName, reviewDate, setReviewDate }: Props) {
  return (
    <div style={S.card}>
      <div style={S.slab}>Review Details</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={S.label}>Reviewer Name</label>
          <input type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Your name" style={S.input} />
        </div>
        <div>
          <label style={S.label}>Review Date</label>
          <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} style={S.input} />
        </div>
      </div>
    </div>
  );
}
