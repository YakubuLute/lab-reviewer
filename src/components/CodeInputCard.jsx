import { S } from "../styles/formStyles";

export default function CodeInputCard({
  codeSource,
  setCodeSource,
  repoUrl,
  setRepoUrl,
  branch,
  setBranch,
  pastedCode,
  setPastedCode,
  codeFiles,
  fetchStatus,
  fetchError,
  truncatedNote,
  onFetchRepo,
}) {
  const isFetching = fetchStatus === "fetching";

  return (
    <div style={S.card}>
      <div style={S.slab}>Code Input</div>

      {/* Toggle */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {["github", "paste"].map((mode) => (
          <button
            key={mode}
            onClick={() => setCodeSource(mode)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "none",
              background:
                codeSource === mode
                  ? "rgba(99,102,241,0.25)"
                  : "transparent",
              color: codeSource === mode ? "#c7d2fe" : "#475569",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {mode === "github" ? "Fetch from GitHub" : "Paste Code"}
          </button>
        ))}
      </div>

      {codeSource === "github" ? (
        <>
          <label style={S.label}>Repository URL</label>
          <input
            type="url"
            placeholder="https://github.com/owner/repo  or  https://github.com/owner/repo/tree/main"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            style={{ ...S.input, marginBottom: 10 }}
          />
          <label style={S.label}>Branch (optional — defaults to repo default)</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              style={{ ...S.input, marginBottom: 0 }}
            />
            <button
              onClick={onFetchRepo}
              disabled={!repoUrl.trim() || isFetching}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                background:
                  repoUrl.trim() && !isFetching
                    ? "rgba(99,102,241,0.25)"
                    : "rgba(255,255,255,0.05)",
                color:
                  repoUrl.trim() && !isFetching ? "#c7d2fe" : "#334155",
                fontSize: 13,
                fontWeight: 700,
                cursor: repoUrl.trim() && !isFetching ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {isFetching ? "Fetching..." : "Fetch Code"}
            </button>
          </div>

          {fetchStatus === "error" && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                color: "#fca5a5",
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              {fetchError}
            </div>
          )}

          {fetchStatus === "done" && codeFiles.length > 0 && (
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.18)",
                borderRadius: 8,
                marginBottom: truncatedNote ? 8 : 0,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#22c55e",
                  marginBottom: 6,
                }}
              >
                {codeFiles.length} file{codeFiles.length !== 1 ? "s" : ""} loaded
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px 10px",
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              >
                {codeFiles.map((f) => (
                  <span
                    key={f.path}
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontFamily: "monospace",
                    }}
                  >
                    {f.path}
                  </span>
                ))}
              </div>
            </div>
          )}

          {truncatedNote && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8,
                fontSize: 11,
                color: "#fbbf24",
              }}
            >
              {truncatedNote}
            </div>
          )}
        </>
      ) : (
        <>
          <label style={S.label}>
            Paste code below. Separate multiple files with{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.07)",
                padding: "1px 6px",
                borderRadius: 4,
                fontSize: 11,
              }}
            >
              // --- filename.js ---
            </code>{" "}
            comment lines.
          </label>
          <textarea
            rows={12}
            placeholder={"// --- server.js ---\nconst express = require('express');\n...\n\n// --- routes/tasks.js ---\n..."}
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            style={{
              ...S.input,
              minHeight: 200,
              resize: "vertical",
              lineHeight: 1.5,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          />
          {pastedCode.trim() && (
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "#475569",
              }}
            >
              {pastedCode.trim().length.toLocaleString()} chars pasted
            </div>
          )}
        </>
      )}
    </div>
  );
}
