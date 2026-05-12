import { RATING_LABELS, PASSING_SCORE, getWeight } from "../data/scoring";
import { S } from "../styles/formStyles";

export default function CriteriaScoringCard({
  lab,
  attempt,
  scores,
  setScores,
  feedbacks,
  setFeedbacks,
  totalScore,
  grade,
  maxScore,
  passed,
}) {
  return (
    <div style={S.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={S.slab}>Evaluation Criteria</div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: grade.color }}>
            {totalScore}
          </span>
          <span style={{ fontSize: 13, color: "#475569" }}>
            {" "}
            / {maxScore}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: grade.color,
              marginLeft: 8,
            }}
          >
            ({grade.label})
          </span>
          <div
            style={{
              fontSize: 11,
              color: passed ? "#22c55e" : "#ef4444",
              marginTop: 2,
            }}
          >
            {passed
              ? "✅ Passed"
              : `❌ Below passing score (${PASSING_SCORE})`}
          </div>
        </div>
      </div>

      {lab.criteria.map((c) => {
        const raw = scores[c.id] || 0;
        const ew = getWeight(c.weight, attempt);
        return (
          <div
            key={c.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "18px 22px",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: "rgba(99,102,241,0.2)",
                      color: "#818cf8",
                      padding: "2px 8px",
                      borderRadius: 20,
                    }}
                  >
                    {ew}%{attempt === "2nd" ? ` (base ${c.weight}%)` : ""}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {c.description}
                </p>
              </div>
              <div
                style={{ textAlign: "center", minWidth: 54, marginLeft: 16 }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: raw === 0 ? "#334155" : "#818cf8",
                  }}
                >
                  {raw} / 5
                </div>
                <div style={{ fontSize: 10, color: "#475569" }}>
                  weight: {ew}%
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={raw}
                onChange={(e) =>
                  setScores((p) => ({
                    ...p,
                    [c.id]: parseInt(e.target.value),
                  }))
                }
                style={{
                  flex: 1,
                  accentColor: "#818cf8",
                  cursor: "pointer",
                  height: 4,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: raw === 0 ? "#475569" : "#c7d2fe",
                  minWidth: 96,
                  textAlign: "right",
                  fontStyle: raw === 0 ? "italic" : "normal",
                }}
              >
                {RATING_LABELS[raw]}
              </span>
            </div>

            <input
              type="text"
              placeholder="Inline notes for this criterion…"
              value={feedbacks[c.id] || ""}
              onChange={(e) =>
                setFeedbacks((p) => ({ ...p, [c.id]: e.target.value }))
              }
              style={{
                marginTop: 10,
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "#94a3b8",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
