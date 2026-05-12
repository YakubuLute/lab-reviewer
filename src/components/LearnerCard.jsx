import { LEARNERS, EMMANUEL_EMAIL } from "../data/learners";
import { S } from "../styles/formStyles";

export default function LearnerCard({
  learnerName,
  learnerEmail,
  handleLearnerSelect,
}) {
  return (
    <div style={S.card}>
      <div style={S.slab}>Learner</div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        <div>
          <label style={S.label}>Select Learner</label>
          <select
            value={learnerName}
            onChange={(e) => handleLearnerSelect(e.target.value)}
            style={{
              ...S.input,
              color: learnerName ? "#f1f5f9" : "#475569",
              cursor: "pointer",
            }}
          >
            <option value="">— Choose a learner —</option>
            {LEARNERS.map((l) => (
              <option key={l.email} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>Learner Email</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={learnerEmail}
              readOnly
              placeholder="Auto-filled on learner select"
              style={{
                ...S.input,
                color: learnerEmail ? "#818cf8" : "#334155",
                background: learnerEmail
                  ? "rgba(99,102,241,0.08)"
                  : "rgba(255,255,255,0.02)",
                cursor: "default",
                paddingRight: learnerEmail ? 36 : 12,
              }}
            />
            {learnerEmail && (
              <div
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                }}
              >
                ✓
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>📋</span>
        <div>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            CC on every email:{" "}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#818cf8" }}>
            {EMMANUEL_EMAIL}
          </span>
        </div>
      </div>
    </div>
  );
}
