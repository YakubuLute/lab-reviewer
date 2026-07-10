import useReviewForm from './hooks/useReviewForm';
import ReviewDetailsCard from './components/ReviewDetailsCard';
import LearnerCard from './components/LearnerCard';
import LabAttemptCard from './components/LabAttemptCard';
import CodeInputCard from './components/CodeInputCard';
import CodeReviewAssistCard from './components/CodeReviewAssistCard';
import CriteriaScoringCard from './components/CriteriaScoringCard';
import FlagsCard from './components/FlagsCard';
import RemarksCard from './components/RemarksCard';
import ReportOutput from './components/ReportOutput';
import LiveScorePanel from './components/LiveScorePanel';

export default function App() {
  const form = useReviewForm();
  const {
    learnerName, learnerEmail, selectedLab, setSelectedLab, attempt, setAttempt,
    scores, setScores, feedbacks, setFeedbacks,
    strengths, setStrengths, improvements, setImprovements, otherRemarks, setOtherRemarks,
    redoLab, setRedoLab, plagiarism, setPlagiarism,
    reviewerName, setReviewerName, reviewDate, setReviewDate,
    codeSource, setCodeSource, repoUrl, setRepoUrl, branch, setBranch,
    pastedCode, setPastedCode, codeFiles, fetchStatus, fetchError, truncatedNote,
    reviewerNotes, setReviewerNotes,
    assistMode, setAssistMode,
    guideReady, guideGenerating, guideGenPct,
    guideNotes, setGuideNotes,
    guideDone, setGuideDone,
    guideSkipped, setGuideSkipped,
    guideExtra, setGuideExtra,
    newGuideQ, setNewGuideQ,
    openSections, setOpenSections,
    liveSession, setLiveSession,
    handleGenerateGuide, handleRegenerateGuide,
    analyzeStatus, analyzeError, aiSuggested,
    lab, maxScore, totalScore, grade, passed, isValid, canAnalyze,
    report, copied,
    handleLearnerSelect, handleFetchRepo, handleAnalyze, handleSendEmail,
    copy, handleGenerate, reset, reportRef,
    sendStatus, sendError,
  } = form;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--sans)', color: 'var(--ink)', padding: '24px 20px 48px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '.12em', color: 'var(--orange-d)', textTransform: 'uppercase', marginBottom: 4 }}>
              AmaliTech · Backend Module
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.01em' }}>
              LabLens
            </h1>
            <p style={{ color: 'var(--ink3)', fontSize: 12.5, marginTop: 2 }}>
              Score · Assist · Analyze · Report
            </p>
          </div>
        </div>

        {/* ── Setup row: reviewer / learner / lab ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 12, marginBottom: 16, alignItems: 'start' }}>
          <ReviewDetailsCard
            reviewerName={reviewerName} setReviewerName={setReviewerName}
            reviewDate={reviewDate} setReviewDate={setReviewDate}
          />
          <LearnerCard
            learnerName={learnerName} learnerEmail={learnerEmail}
            handleLearnerSelect={handleLearnerSelect}
          />
          <LabAttemptCard
            selectedLab={selectedLab} setSelectedLab={setSelectedLab}
            attempt={attempt} setAttempt={setAttempt} lab={lab}
          />
        </div>

        {/* ── Review Workspace (two columns) ──────────────────────────────── */}
        {lab ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

            {/* Left column: numbered step cards */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* 01 · Code Intake */}
              <CodeInputCard
                codeSource={codeSource} setCodeSource={setCodeSource}
                repoUrl={repoUrl} setRepoUrl={setRepoUrl}
                branch={branch} setBranch={setBranch}
                pastedCode={pastedCode} setPastedCode={setPastedCode}
                codeFiles={codeFiles} fetchStatus={fetchStatus}
                fetchError={fetchError} truncatedNote={truncatedNote}
                onFetchRepo={handleFetchRepo}
              />

              {/* 02 · Code Review Assist */}
              <CodeReviewAssistCard
                learnerName={learnerName}
                selectedLab={selectedLab}
                reviewerNotes={reviewerNotes}
                setReviewerNotes={setReviewerNotes}
                assistMode={assistMode} setAssistMode={setAssistMode}
                guideReady={guideReady}
                guideGenerating={guideGenerating}
                guideGenPct={guideGenPct}
                guideNotes={guideNotes} setGuideNotes={setGuideNotes}
                guideDone={guideDone} setGuideDone={setGuideDone}
                guideSkipped={guideSkipped} setGuideSkipped={setGuideSkipped}
                guideExtra={guideExtra} setGuideExtra={setGuideExtra}
                newGuideQ={newGuideQ} setNewGuideQ={setNewGuideQ}
                openSections={openSections} setOpenSections={setOpenSections}
                liveSession={liveSession} setLiveSession={setLiveSession}
                onGenerate={handleGenerateGuide}
                onRegenerate={handleRegenerateGuide}
              />

              {/* Analyze error */}
              {analyzeStatus === 'error' && (
                <div style={{ padding: '10px 14px', background: 'var(--red-t)', border: '1px solid rgba(217,67,74,.2)', borderRadius: 11, color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>
                  Analysis failed: {analyzeError}
                </div>
              )}

              {/* 03 · Criteria Scoring */}
              <div id="criteria-section">
                <CriteriaScoringCard
                  lab={lab} attempt={attempt}
                  scores={scores} setScores={setScores}
                  feedbacks={feedbacks} setFeedbacks={setFeedbacks}
                  totalScore={totalScore} grade={grade} maxScore={maxScore} passed={passed}
                />
              </div>

              {/* Flags */}
              <FlagsCard redoLab={redoLab} setRedoLab={setRedoLab} plagiarism={plagiarism} setPlagiarism={setPlagiarism} />

              {/* 04 · Remarks */}
              <RemarksCard
                strengths={strengths} setStrengths={setStrengths}
                improvements={improvements} setImprovements={setImprovements}
                otherRemarks={otherRemarks} setOtherRemarks={setOtherRemarks}
              />

              {/* Report output */}
              {report && (
                <div ref={reportRef}>
                  <ReportOutput
                    report={report} copied={copied} copy={copy} reset={reset}
                    onSendEmail={handleSendEmail} sendStatus={sendStatus} sendError={sendError}
                  />
                </div>
              )}
            </div>

            {/* Right column: live score + actions (sticky) */}
            <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: 20 }}>
              <LiveScorePanel
                lab={lab} attempt={attempt} scores={scores}
                totalScore={totalScore} maxScore={maxScore} grade={grade} passed={passed}
                redoLab={redoLab} plagiarism={plagiarism}
                isValid={isValid} canAnalyze={canAnalyze}
                analyzeStatus={analyzeStatus} aiSuggested={aiSuggested}
                isValid2={isValid} onAnalyze={handleAnalyze} onGenerate={handleGenerate}
                report={report}
              />
            </div>
          </div>
        ) : (
          /* Empty state when no lab selected */
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 14, boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12, color: 'var(--line)' }}>○</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Select a learner and lab to begin</div>
            <p style={{ fontSize: 13, color: 'var(--ink3)', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
              Fill in reviewer details, choose a learner, and pick a lab module above to open the review workspace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
