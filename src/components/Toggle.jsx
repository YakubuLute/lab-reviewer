export default function Toggle({ label, value, onChange, color }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        userSelect: "none",
        padding: "10px 14px",
        borderRadius: 8,
        transition: "all 0.2s",
        background: value ? `${color}14` : "rgba(255,255,255,0.03)",
        border: `1px solid ${value ? color : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: value ? color : "rgba(255,255,255,0.1)",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: value ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          color: value ? "#f1f5f9" : "#64748b",
          fontWeight: value ? 600 : 400,
        }}
      >
        {label}
      </span>
    </div>
  );
}
