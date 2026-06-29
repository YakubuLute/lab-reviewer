import { useState, useEffect, useRef } from "react";
import { LEARNERS } from "../data/learners";
import { LAB_DATA } from "../data/labs";
import { RATING_LABELS, PASSING_SCORE, getWeight, getMaxScore, gradeInfo } from "../data/scoring";
import { buildEmailHTML } from "../builders/buildEmailHTML";
import { buildExcelRow } from "../builders/buildExcelRow";
import { fetchRepo, analyzeCode, sendEmail } from "../lib/api";

export default function useReviewForm() {
  // ── Core review form ───────────────────────────────────────────────────────
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

  // ── Code input ─────────────────────────────────────────────────────────────
  const [codeSource, setCodeSource] = useState("github");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [pastedCode, setPastedCode] = useState("");
  const [codeFiles, setCodeFiles] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle"); // idle | fetching | done | error
  const [fetchError, setFetchError] = useState("");
  const [truncatedNote, setTruncatedNote] = useState("");

  // ── Reviewer session notes ─────────────────────────────────────────────────
  const [reviewerNotes, setReviewerNotes] = useState("");

  // ── AI analysis state ──────────────────────────────────────────────────────
  const [analyzeStatus, setAnalyzeStatus] = useState("idle"); // idle | analyzing | done | error
  const [analyzeError, setAnalyzeError] = useState("");
  const [aiSuggested, setAiSuggested] = useState(false);   // true once AI has pre-filled fields
  const [aiEmailBody, setAiEmailBody] = useState("");        // plain-text email from AI

  // ── Email sending state ────────────────────────────────────────────────────
  const [sendStatus, setSendStatus] = useState("idle"); // idle | sending | done | error
  const [sendError, setSendError] = useState("");

  // ── Derived ────────────────────────────────────────────────────────────────
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
      setAiSuggested(false);
      setAiEmailBody("");
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

  // Code is "ready" when GitHub files are loaded OR code has been pasted
  const hasCode =
    (codeSource === "github" && codeFiles.length > 0) ||
    (codeSource === "paste" && pastedCode.trim().length > 0);

  const canAnalyze = isValid && lab;

  // ── GitHub fetch ───────────────────────────────────────────────────────────
  const handleFetchRepo = async () => {
    setFetchStatus("fetching");
    setFetchError("");
    setTruncatedNote("");
    setCodeFiles([]);
    try {
      const result = await fetchRepo(repoUrl, branch || undefined);
      setCodeFiles(result.files || []);
      setTruncatedNote(result.truncatedNote || "");
      setFetchStatus("done");
    } catch (err) {
      setFetchError(err.message);
      setFetchStatus("error");
    }
  };

  // ── AI analysis ────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzeStatus("analyzing");
    setAnalyzeError("");

    // Build the code files array from either source
    let files = [];
    if (codeSource === "github" && codeFiles.length > 0) {
      files = codeFiles;
    } else if (codeSource === "paste" && pastedCode.trim()) {
      files = [{ path: "pasted-code.txt", content: pastedCode.trim() }];
    }

    try {
      const result = await analyzeCode({
        learnerName,
        labTitle: selectedLab,
        attempt,
        reviewerNotes,
        codeFiles: files,
        reviewerName,
      });

      // Pre-fill criterion scores and inline comments
      const newScores = { ...scores };
      const newFeedbacks = { ...feedbacks };
      (result.criteria || []).forEach((c) => {
        if (c.id in newScores) newScores[c.id] = c.score;
        if (c.comment) newFeedbacks[c.id] = c.comment;
      });
      setScores(newScores);
      setFeedbacks(newFeedbacks);

      // Pre-fill remark blocks
      if (result.strengths) setStrengths(result.strengths);
      if (result.gaps) setImprovements(result.gaps);
      if (result.otherRemarks) setOtherRemarks(result.otherRemarks);

      // Pre-fill flags
      if (result.redoRecommended !== undefined) setRedoLab(result.redoRecommended);
      if (result.plagiarismConcern !== undefined) setPlagiarism(result.plagiarismConcern);

      // Store the plain-text email body for display in the report
      if (result.emailBody) setAiEmailBody(result.emailBody);

      setAiSuggested(true);
      setAnalyzeStatus("done");

      // Scroll down to criteria so the reviewer can review the suggestions
      setTimeout(() => {
        document.getElementById("criteria-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      setAnalyzeError(err.message);
      setAnalyzeStatus("error");
    }
  };

  // ── Copy ───────────────────────────────────────────────────────────────────
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

  // ── Generate report ────────────────────────────────────────────────────────
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
      subject: `Lab Review: ${selectedLab} \u2014 ${learnerName} (${grade.label})`,
      aiEmailBody,
    });
    setSendStatus("idle");
    setSendError("");
    setTimeout(
      () => reportRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  // ── Send email ─────────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    if (!report) return;
    setSendStatus("sending");
    setSendError("");
    try {
      await sendEmail({
        to: report.learnerEmail,
        subject: report.subject,
        html: report.html,
      });
      setSendStatus("done");
    } catch (err) {
      setSendError(err.message);
      setSendStatus("error");
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
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
    setCodeSource("github");
    setRepoUrl("");
    setBranch("");
    setPastedCode("");
    setCodeFiles([]);
    setFetchStatus("idle");
    setFetchError("");
    setTruncatedNote("");
    setReviewerNotes("");
    setAnalyzeStatus("idle");
    setAnalyzeError("");
    setAiSuggested(false);
    setAiEmailBody("");
    setSendStatus("idle");
    setSendError("");
  };

  return {
    // Core fields
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
    // Code input
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
    // Reviewer notes
    reviewerNotes,
    setReviewerNotes,
    // AI analysis
    analyzeStatus,
    analyzeError,
    aiSuggested,
    // Send email
    sendStatus,
    sendError,
    // Derived
    lab,
    maxScore,
    totalScore,
    grade,
    passed,
    isValid,
    hasCode,
    canAnalyze,
    // Output
    report,
    copied,
    // Handlers
    handleLearnerSelect,
    handleFetchRepo,
    handleAnalyze,
    handleSendEmail,
    copy,
    handleGenerate,
    reset,
    reportRef,
  };
}
