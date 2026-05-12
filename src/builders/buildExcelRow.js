export function buildExcelRow({
  reviewDate,
  learnerName,
  reviewerName,
  selectedLab,
  attempt,
  criteriaRows,
  totalScore,
  redoLab,
  plagiarism,
  strengths,
  improvements,
  otherRemarks,
}) {
  return [
    new Date(reviewDate).toLocaleDateString("en-GB"),
    learnerName,
    reviewerName,
    selectedLab,
    attempt,
    ...criteriaRows.map((c) => c.weightedScore),
    totalScore,
    redoLab ? "Yes" : "No",
    plagiarism ? "Yes" : "No",
    strengths,
    improvements,
    otherRemarks,
  ].join("\t");
}
