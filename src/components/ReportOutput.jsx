import { EMMANUEL_EMAIL } from "../data/learners";
import { S } from "../styles/formStyles";

export default function ReportOutput({ report, copied, copy, reset }) {
  const openInBrowser = () => {
    const blob = new Blob([report.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <>
      {/* Action bar */}
      <div
        style={{
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{ fontSize: 15, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}
        >
          ✅ Report ready!
        </div>

        {/* Email addresses */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {[
            { label: "To", value: report.learnerEmail, color: "#c7d2fe" },
            { label: "CC", value: EMMANUEL_EMAIL, color: "#818cf8" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                padding: "8px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginBottom: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 13, color, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Copy buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { key: "subject", icon: "📋", label: "Copy Subject", value: report.subject },
            { key: "html", icon: "📧", label: "Copy Email HTML", value: report.html },
            { key: "excel", icon: "📊", label: "Copy Excel Row", value: report.excelRow },
            { key: "lemail", icon: "@", label: "Copy To Email", value: report.learnerEmail },
          ].map(({ key, icon, label, value }) => (
            <button
              key={key}
              onClick={() => copy(value, key)}
              style={S.copyBtn(copied, key)}
            >
              {copied === key ? "✓ Copied!" : `${icon} ${label}`}
            </button>
          ))}
          <button
            onClick={reset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#475569",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              marginLeft: "auto",
            }}
          >
            ← New Review
          </button>
        </div>

        {/* Fallback selectable text areas */}
        <div
          style={{
            marginTop: 16,
            padding: "14px 16px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
          }}
        >
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>
            💡 Click inside any field below — it auto-selects. Then press
            Ctrl+C (or Cmd+C on Mac) to copy.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                label: "Subject Line",
                value: report.subject,
                rows: 1,
                color: "#c7d2fe",
                fontSize: 12,
                resize: "none",
              },
              {
                label: "Excel Row",
                value: report.excelRow,
                rows: 2,
                color: "#94a3b8",
                fontSize: 11,
                resize: "none",
              },
              {
                label: "Email HTML (paste into Outlook HTML mode)",
                value: report.html,
                rows: 5,
                color: "#64748b",
                fontSize: 11,
                resize: "vertical",
              },
            ].map(({ label, value, rows, color, fontSize, resize }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 10,
                    color: "#4f46e5",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </div>
                <textarea
                  readOnly
                  value={value}
                  rows={rows}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color,
                    fontSize,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                    resize,
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Excel row preview */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#4f46e5",
              textTransform: "uppercase",
              letterSpacing: ".1em",
            }}
          >
            📊 Excel Row Preview
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            Tab-separated — paste directly into your sheet
          </div>
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#4f46e5",
              marginBottom: 6,
              letterSpacing: "0.05em",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              overflowX: "auto",
            }}
          >
            DATE │ LEARNER │ REVIEWER │ LAB │ ATTEMPT │{" "}
            {report.criteriaRows
              .map((c) => c.criterion.split(" ")[0])
              .join(" │ ")}{" "}
            │ TOTAL │ REDO │ PLAGIARISM │ STRENGTHS │ GAPS │ OTHER
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#94a3b8",
              fontFamily: "monospace",
              wordBreak: "break-all",
              lineHeight: 1.8,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {report.excelRow}
          </div>
        </div>
      </div>

      {/* Email preview */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#4f46e5",
              textTransform: "uppercase",
              letterSpacing: ".1em",
            }}
          >
            📧 Email Preview
          </div>
          <button
            onClick={openInBrowser}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 8,
              color: "#818cf8",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🌐 Open in Browser
          </button>
        </div>
        <div style={{ background: "#f8fafc" }}>
          <iframe
            srcDoc={report.html}
            style={{ width: "100%", height: 640, border: "none", display: "block" }}
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Sending guide */}
      <div
        style={{
          background: "rgba(79,70,229,0.06)",
          border: "1px solid rgba(79,70,229,0.15)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#818cf8",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            marginBottom: 6,
          }}
        >
          How to Send in Outlook
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#f59e0b",
            marginBottom: 14,
            padding: "8px 12px",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 8,
          }}
        >
          ⭐ Recommended: Use the <strong>Open in Browser</strong> method
          below for the best formatting result in Outlook.
        </div>
        {[
          "Click 🌐 Open in Browser above — the email opens in a new browser tab",
          "In the browser tab, press Ctrl+A (Windows) or Cmd+A (Mac) to select all",
          "Press Ctrl+C / Cmd+C to copy the formatted content",
          "Open Outlook → New Email",
          "Click inside the email body and press Ctrl+V / Cmd+V to paste — formatting comes in perfectly",
          `Set To: (use the @ Copy To Email button) and CC: ${EMMANUEL_EMAIL}`,
          "Copy Subject using 📋 Copy Subject and paste it into the Subject field",
          "Hit Send",
        ].map((text, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 10,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(99,102,241,0.3)",
                color: "#818cf8",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i + 1}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
              {text}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
