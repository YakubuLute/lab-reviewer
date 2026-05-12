export const RATING_LABELS = [
  "Not attempted",
  "Poor",
  "Below average",
  "Average",
  "Good",
  "Excellent",
];

export const PASSING_SCORE = 80;

export const getWeight = (base, attempt) =>
  attempt === "2nd" ? parseFloat((base * 0.8).toFixed(1)) : base;

export const getMaxScore = (attempt) => (attempt === "2nd" ? 80 : 100);

export const gradeInfo = (score, attempt) => {
  const s = parseFloat(score),
    max = getMaxScore(attempt),
    pct = (s / max) * 100;
  if (s >= PASSING_SCORE) {
    if (pct >= 95) return { label: "Distinction", color: "#22c55e" };
    if (pct >= 85) return { label: "Merit", color: "#3b82f6" };
    return { label: "Pass", color: "#f59e0b" };
  }
  return { label: "Needs Work", color: "#ef4444" };
};
