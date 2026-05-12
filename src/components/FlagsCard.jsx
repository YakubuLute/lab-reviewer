import Toggle from "./Toggle";
import { S } from "../styles/formStyles";

export default function FlagsCard({
  redoLab,
  setRedoLab,
  plagiarism,
  setPlagiarism,
}) {
  return (
    <div style={S.card}>
      <div style={S.slab}>Flags</div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
      >
        <Toggle
          label="Re-do Lab Required"
          value={redoLab}
          onChange={setRedoLab}
          color="#f59e0b"
        />
        <Toggle
          label="Plagiarism Flagged"
          value={plagiarism}
          onChange={setPlagiarism}
          color="#ef4444"
        />
      </div>
    </div>
  );
}
