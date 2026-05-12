import { LAB_DATA } from "../data/labs";
import { S } from "../styles/formStyles";

export default function LabAttemptCard({
  selectedLab,
  setSelectedLab,
  attempt,
  setAttempt,
  lab,
}) {
  return (
    <div style={S.card}>
      <div style={S.slab}>Lab & Attempt</div>
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}
      >
        <div>
          <label style={S.label}>Lab Module</label>
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            style={{
              ...S.input,
              color: selectedLab ? "#f1f5f9" : "#475569",
              cursor: "pointer",
            }}
          >
            <option value="">— Choose a lab —</option>
            {Object.keys(LAB_DATA).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>Attempt</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["1st", "2nd"].map((a) => (
              <button
                key={a}
                onClick={() => setAttempt(a)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  fontFamily: "inherit",
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border:
                    attempt === a
                      ? "2px solid #818cf8"
                      : "1px solid rgba(255,255,255,0.08)",
                  background:
                    attempt === a
                      ? "rgba(99,102,241,0.2)"
                      : "rgba(255,255,255,0.03)",
                  color: attempt === a ? "#c7d2fe" : "#475569",
                  fontWeight: attempt === a ? 700 : 400,
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {attempt === "2nd" && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 8,
            fontSize: 12,
            color: "#f59e0b",
          }}
        >
          ⚠️ 2nd attempt — weights scaled to 80% of original. Maximum
          achievable score is <strong>80</strong>.
        </div>
      )}

      {lab && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            background: "rgba(99,102,241,0.08)",
            borderRadius: 8,
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          {lab.description}
        </div>
      )}
    </div>
  );
}
