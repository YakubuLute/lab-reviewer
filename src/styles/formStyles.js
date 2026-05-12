export const S = {
  card: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 24,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 6,
    fontWeight: 600,
    display: "block",
  },
  slab: {
    fontSize: 12,
    fontWeight: 700,
    color: "#4f46e5",
    textTransform: "uppercase",
    letterSpacing: ".1em",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#f1f5f9",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  copyBtn: (copied, key) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px",
    background:
      copied === key
        ? "rgba(34,197,94,0.15)"
        : copied === key + "_fail"
          ? "rgba(239,68,68,0.1)"
          : "rgba(99,102,241,0.15)",
    border: `1px solid ${copied === key ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"}`,
    borderRadius: 8,
    color: copied === key ? "#22c55e" : "#818cf8",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  }),
};
