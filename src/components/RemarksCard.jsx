import { S } from "../styles/formStyles";

export default function RemarksCard({
  strengths,
  setStrengths,
  improvements,
  setImprovements,
  otherRemarks,
  setOtherRemarks,
}) {
  const fields = [
    {
      label: "Strengths",
      ph: "What did the learner do particularly well?",
      val: strengths,
      set: setStrengths,
    },
    {
      label: "Gaps",
      ph: "What areas need improvement?",
      val: improvements,
      set: setImprovements,
    },
    {
      label: "Other Remarks",
      ph: "Any additional comments…",
      val: otherRemarks,
      set: setOtherRemarks,
    },
  ];

  return (
    <div style={S.card}>
      <div style={S.slab}>Remarks</div>
      {fields.map(({ label, ph, val, set }) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <label style={S.label}>{label}</label>
          <textarea
            value={val}
            onChange={(e) => set(e.target.value)}
            placeholder={ph}
            rows={3}
            style={{ ...S.input, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>
      ))}
    </div>
  );
}
