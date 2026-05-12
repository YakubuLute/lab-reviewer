import { useState, useEffect, useRef } from "react";
import { LEARNERS } from "../data/learners";
import { LAB_DATA } from "../data/labs";
import { RATING_LABELS, PASSING_SCORE, getWeight, getMaxScore, gradeInfo } from "../data/scoring";
import { buildEmailHTML } from "../builders/buildEmailHTML";
import { buildExcelRow } from "../builders/buildExcelRow";

export default function useReviewForm() {
  const [learnerName, setLearnerName] = useState("");
  const [learnerEmail, setLearnerEmail] = useState("");
  const [selectedLab, setSelectedLab] = useState("");
  const [attempt, setAttempt] = useState("1st");
  const [scores, setScores] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [otherRemarks, setOtherRemarks] = useState("");
  const [redoLab, setRedoLab] = useState(false);
  const [plagiarism, setPlagiarism] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState("");
  const reportRef = useRef(null);

  const lab = selectedLab ? LAB_DATA[selectedLab] : null;
  const maxScore = getMaxScore(attempt);

  const handleLearnerSelect = (name) => {
    setLearnerName(name);
    const found = LEARNERS.find((l) => l.name === name);
    setLearnerEmail(found ? found.email : "");
  };

  useEffect(() => {
    if (selectedLab) {
      const init = {};
      LAB_DATA[selectedLab].criteria.forEach((c) => {
        init[c.id] = 0;
      });
      setScores(init);
      setFeedbacks({});
    }
  }, [selectedLab]);

  const weightedScore = (id, base) =>
    (((scores[id] || 0) / 5) * getWeight(base, attempt)).toFixed(1);

  const totalScore = lab
    ? lab.criteria
        .reduce(
          (s, c) =>
            s + ((scores[c.id] || 0) / 5) * getWeight(c.weight, attempt),
          0,
        )
        .toFixed(1)
    : "0";

  const grade = gradeInfo(totalScore, attempt);
  const passed = parseFloat(totalScore) >= PASSING_SCORE;
  const isValid =
    learnerName && learnerEmail && selectedLab && reviewerName && reviewDate;

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2200);
    }).catch(() => {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
        document.body.appendChild(el);
        el.select();
        el.setSelectionRange(0, el.value.length);
        document.execCommand("copy"); // eslint-disable-line
        document.body.removeChild(el);
        setCopied(key);
      } catch {
        setCopied(key + "_fail");
      }
      setTimeout(() => setCopied(""), 2200);
    });
  };

  const handleGenerate = () => {
    const criteriaRows = lab.criteria.map((c) => ({
      criterion: c.name,
      weight: c.weight,
      effectiveWeight: getWeight(c.weight, attempt),
      rating: RATING_LABELS[scores[c.id] || 0],
      rawScore: scores[c.id] || 0,
      weightedScore: parseFloat(weightedScore(c.id, c.weight)),
      feedback: feedbacks[c.id] || "",
    }));
    const data = {
      learnerName,
      learnerEmail,
      selectedLab,
      attempt,
      totalScore,
      maxScore,
      grade,
      passed,
      redoLab,
      plagiarism,
      strengths,
      improvements,
      otherRemarks,
      reviewerName,
      reviewDate,
      criteriaRows,
    };
    setReport({
      ...data,
      html: buildEmailHTML(data),
      excelRow: buildExcelRow(data),
      subject: `Lab Review: ${selectedLab} — ${learnerName} (${grade.label})`,
    });
    setTimeout(
      () => reportRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const reset = () => {
    setLearnerName("");
    setLearnerEmail("");
    setSelectedLab("");
    setAttempt("1st");
    setStrengths("");
    setImprovements("");
    setOtherRemarks("");
    setRedoLab(false);
    setPlagiarism(false);
    setReport(null);
    setReviewDate(new Date().toISOString().split("T")[0]);
  };

  return {
    // form fields
    learnerName,
    learnerEmail,
    selectedLab,
    setSelectedLab,
    attempt,
    setAttempt,
    scores,
    setScores,
    feedbacks,
    setFeedbacks,
    strengths,
    setStrengths,
    improvements,
    setImprovements,
    otherRemarks,
    setOtherRemarks,
    redoLab,
    setRedoLab,
    plagiarism,
    setPlagiarism,
    reviewerName,
    setReviewerName,
    reviewDate,
    setReviewDate,
    // derived
    lab,
    maxScore,
    totalScore,
    grade,
    passed,
    isValid,
    // output
    report,
    copied,
    // handlers
    handleLearnerSelect,
    copy,
    handleGenerate,
    reset,
    reportRef,
  };
}
