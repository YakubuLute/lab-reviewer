import { useState, useEffect, useRef } from 'react';
import type { CodeFile, GradeInfo, Report } from '../../shared/types';
import { LEARNERS } from '../data/learners';
import { LAB_DATA } from '../data/labs';
import { RATING_LABELS, PASSING_SCORE, getWeight, getMaxScore, gradeInfo } from '../data/scoring';
import { buildEmailHTML } from '../builders/buildEmailHTML';
import { buildExcelRow } from '../builders/buildExcelRow';
import { fetchRepo, analyzeCode, sendEmail } from '../lib/api';

type FetchStatus = 'idle' | 'fetching' | 'done' | 'error';
type AnalyzeStatus = 'idle' | 'analyzing' | 'done' | 'error';
type SendStatus = 'idle' | 'sending' | 'done' | 'error';

export default function useReviewForm() {
  // ── Core form ─────────────────────────────────────────────────────────────
  const [learnerName, setLearnerName] = useState('');
  const [learnerEmail, setLearnerEmail] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [attempt, setAttempt] = useState('1st');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [otherRemarks, setOtherRemarks] = useState('');
  const [redoLab, setRedoLab] = useState(false);
  const [plagiarism, setPlagiarism] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  // ── Code input ────────────────────────────────────────────────────────────
  const [codeSource, setCodeSource] = useState<'github' | 'paste'>('github');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [pastedCode, setPastedCode] = useState('');
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetchError, setFetchError] = useState('');
  const [truncatedNote, setTruncatedNote] = useState('');

  // ── Reviewer notes ────────────────────────────────────────────────────────
  const [reviewerNotes, setReviewerNotes] = useState('');

  // ── AI state ──────────────────────────────────────────────────────────────
  const [analyzeStatus, setAnalyzeStatus] = useState<AnalyzeStatus>('idle');
  const [analyzeError, setAnalyzeError] = useState('');
  const [aiSuggested, setAiSuggested] = useState(false);
  const [aiEmailBody, setAiEmailBody] = useState('');

  // ── Email sending ─────────────────────────────────────────────────────────
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [sendError, setSendError] = useState('');

  // ── Derived ───────────────────────────────────────────────────────────────
  const lab = selectedLab ? LAB_DATA[selectedLab] ?? null : null;
  const maxScore = getMaxScore(attempt);

  const handleLearnerSelect = (name: string) => {
    setLearnerName(name);
    const found = LEARNERS.find((l) => l.name === name);
    setLearnerEmail(found ? found.email : '');
  };

  useEffect(() => {
    if (selectedLab) {
      const init: Record<string, number> = {};
      LAB_DATA[selectedLab]?.criteria.forEach((c) => { init[c.id] = 0; });
      setScores(init);
      setFeedbacks({});
      setAiSuggested(false);
      setAiEmailBody('');
    }
  }, [selectedLab]);

  const weightedScore = (id: string, base: number): string =>
    (((scores[id] ?? 0) / 5) * getWeight(base, attempt)).toFixed(1);

  const totalScore: string = lab
    ? lab.criteria.reduce((s, c) => s + ((scores[c.id] ?? 0) / 5) * getWeight(c.weight, attempt), 0).toFixed(1)
    : '0';

  const grade: GradeInfo = gradeInfo(totalScore, attempt);
  const passed = parseFloat(totalScore) >= PASSING_SCORE;
  const isValid = !!(learnerName && learnerEmail && selectedLab && reviewerName && reviewDate);
  const canAnalyze = isValid && !!lab;

  // ── GitHub fetch ──────────────────────────────────────────────────────────
  const handleFetchRepo = async () => {
    setFetchStatus('fetching');
    setFetchError('');
    setTruncatedNote('');
    setCodeFiles([]);
    try {
      const result = await fetchRepo(repoUrl, branch || undefined);
      setCodeFiles(result.files ?? []);
      setTruncatedNote(result.truncatedNote ?? '');
      setFetchStatus('done');
    } catch (err) {
      setFetchError((err as Error).message);
      setFetchStatus('error');
    }
  };

  // ── AI analysis ───────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzeStatus('analyzing');
    setAnalyzeError('');

    const files: CodeFile[] =
      codeSource === 'github' && codeFiles.length > 0
        ? codeFiles
        : codeSource === 'paste' && pastedCode.trim()
          ? [{ path: 'pasted-code.txt', content: pastedCode.trim() }]
          : [];

    try {
      const result = await analyzeCode({
        learnerName, labTitle: selectedLab, attempt,
        reviewerNotes, codeFiles: files, reviewerName,
      });

      const newScores = { ...scores };
      const newFeedbacks = { ...feedbacks };
      result.criteria.forEach((c) => {
        if (c.id in newScores) newScores[c.id] = c.score;
        if (c.comment) newFeedbacks[c.id] = c.comment;
      });
      setScores(newScores);
      setFeedbacks(newFeedbacks);

      if (result.strengths)    setStrengths(result.strengths);
      if (result.gaps)         setImprovements(result.gaps);
      if (result.otherRemarks) setOtherRemarks(result.otherRemarks);
      if (result.redoRecommended  !== undefined) setRedoLab(result.redoRecommended);
      if (result.plagiarismConcern !== undefined) setPlagiarism(result.plagiarismConcern);
      if (result.emailBody) setAiEmailBody(result.emailBody);

      setAiSuggested(true);
      setAnalyzeStatus('done');
      setTimeout(() => document.getElementById('criteria-section')?.scrollIntoView({ behavior: 'smooth' }), 150);
    } catch (err) {
      setAnalyzeError((err as Error).message);
      setAnalyzeStatus('error');
    }
  };

  // ── Copy ──────────────────────────────────────────────────────────────────
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2200);
    }).catch(() => {
      try {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
        document.body.appendChild(el);
        el.select();
        el.setSelectionRange(0, el.value.length);
        document.execCommand('copy'); // eslint-disable-line @typescript-eslint/no-deprecated
        document.body.removeChild(el);
        setCopied(key);
      } catch {
        setCopied(key + '_fail');
      }
      setTimeout(() => setCopied(''), 2200);
    });
  };

  // ── Generate report ───────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!lab) return;
    const criteriaRows = lab.criteria.map((c) => ({
      criterion: c.name,
      weight: c.weight,
      effectiveWeight: getWeight(c.weight, attempt),
      rating: RATING_LABELS[scores[c.id] ?? 0],
      rawScore: scores[c.id] ?? 0,
      weightedScore: parseFloat(weightedScore(c.id, c.weight)),
      feedback: feedbacks[c.id] ?? '',
    }));
    const data = { learnerName, learnerEmail, selectedLab, attempt, totalScore, maxScore, grade, passed, redoLab, plagiarism, strengths, improvements, otherRemarks, reviewerName, reviewDate, criteriaRows };
    setReport({ ...data, html: buildEmailHTML(data), excelRow: buildExcelRow(data), subject: `Lab Review: ${selectedLab} \u2014 ${learnerName} (${grade.label})`, aiEmailBody });
    setSendStatus('idle');
    setSendError('');
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ── Send email ────────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    if (!report) return;
    setSendStatus('sending');
    setSendError('');
    try {
      await sendEmail({ to: report.learnerEmail, subject: report.subject, html: report.html });
      setSendStatus('done');
    } catch (err) {
      setSendError((err as Error).message);
      setSendStatus('error');
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setLearnerName(''); setLearnerEmail(''); setSelectedLab(''); setAttempt('1st');
    setStrengths(''); setImprovements(''); setOtherRemarks('');
    setRedoLab(false); setPlagiarism(false); setReport(null);
    setReviewDate(new Date().toISOString().split('T')[0]);
    setCodeSource('github'); setRepoUrl(''); setBranch(''); setPastedCode('');
    setCodeFiles([]); setFetchStatus('idle'); setFetchError(''); setTruncatedNote('');
    setReviewerNotes(''); setAnalyzeStatus('idle'); setAnalyzeError('');
    setAiSuggested(false); setAiEmailBody(''); setSendStatus('idle'); setSendError('');
  };

  return {
    learnerName, learnerEmail, selectedLab, setSelectedLab, attempt, setAttempt,
    scores, setScores, feedbacks, setFeedbacks,
    strengths, setStrengths, improvements, setImprovements, otherRemarks, setOtherRemarks,
    redoLab, setRedoLab, plagiarism, setPlagiarism,
    reviewerName, setReviewerName, reviewDate, setReviewDate,
    codeSource, setCodeSource, repoUrl, setRepoUrl, branch, setBranch,
    pastedCode, setPastedCode, codeFiles, fetchStatus, fetchError, truncatedNote,
    reviewerNotes, setReviewerNotes,
    analyzeStatus, analyzeError, aiSuggested,
    sendStatus, sendError,
    lab, maxScore, totalScore, grade, passed, isValid, canAnalyze,
    report, copied,
    handleLearnerSelect, handleFetchRepo, handleAnalyze, handleSendEmail, copy, handleGenerate, reset, reportRef,
  };
}
