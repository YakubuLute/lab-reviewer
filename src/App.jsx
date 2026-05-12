import useReviewForm from "./hooks/useReviewForm";
import ReviewDetailsCard from "./components/ReviewDetailsCard";
import LearnerCard from "./components/LearnerCard";
import LabAttemptCard from "./components/LabAttemptCard";
import CriteriaScoringCard from "./components/CriteriaScoringCard";
import FlagsCard from "./components/FlagsCard";
import RemarksCard from "./components/RemarksCard";
import ReportOutput from "./components/ReportOutput";

export default function App() {
  const {
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
    lab,
    maxScore,
    totalScore,
    grade,
    passed,
    isValid,
    report,
    copied,
    handleLearnerSelect,
    copy,
    handleGenerate,
    reset,
    reportRef,
  } = useReviewForm();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        fontFamily: "'DM Sans',-apple-system,sans-serif",
        color: "#f1f5f9",
        padding: "32px 20px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        input[type=range]{-webkit-appearance:none;appearance:none;background:rgba(255,255,255,0.1);border-radius:999px;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#818cf8;cursor:pointer;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5);}
        select option{background:#1e293b;color:#f1f5f9;}
        ::placeholder{color:#334155;}
        input:focus,textarea:focus,select:focus{border-color:rgba(129,140,248,0.4)!important;}
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#4f46e5",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            AmaliTech · Backend Module
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900,
              background: "linear-gradient(135deg,#f1f5f9,#818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Lab Review Tool
          </h1>
          <p style={{ color: "#475569", fontSize: 14, marginTop: 8 }}>
            Score a learner → Generate email & Excel row instantly
          </p>
        </div>

        <ReviewDetailsCard
          reviewerName={reviewerName}
          setReviewerName={setReviewerName}
          reviewDate={reviewDate}
          setReviewDate={setReviewDate}
        />

        <LearnerCard
          learnerName={learnerName}
          learnerEmail={learnerEmail}
          handleLearnerSelect={handleLearnerSelect}
        />

        <LabAttemptCard
          selectedLab={selectedLab}
          setSelectedLab={setSelectedLab}
          attempt={attempt}
          setAttempt={setAttempt}
          lab={lab}
        />

        {lab && (
          <CriteriaScoringCard
            lab={lab}
            attempt={attempt}
            scores={scores}
            setScores={setScores}
            feedbacks={feedbacks}
            setFeedbacks={setFeedbacks}
            totalScore={totalScore}
            grade={grade}
            maxScore={maxScore}
            passed={passed}
          />
        )}

        {lab && (
          <FlagsCard
            redoLab={redoLab}
            setRedoLab={setRedoLab}
            plagiarism={plagiarism}
            setPlagiarism={setPlagiarism}
          />
        )}

        {lab && (
          <RemarksCard
            strengths={strengths}
            setStrengths={setStrengths}
            improvements={improvements}
            setImprovements={setImprovements}
            otherRemarks={otherRemarks}
            setOtherRemarks={setOtherRemarks}
          />
        )}

        {lab && !report && (
          <>
            <button
              onClick={handleGenerate}
              disabled={!isValid}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 12,
                border: "none",
                background: isValid
                  ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                  : "rgba(255,255,255,0.05)",
                color: isValid ? "#fff" : "#334155",
                fontSize: 15,
                fontWeight: 700,
                cursor: isValid ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                letterSpacing: "0.02em",
              }}
            >
              Generate Report →
            </button>
            {!isValid && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#334155",
                  marginTop: 8,
                }}
              >
                Select a learner, lab, fill in reviewer name and date to
                continue
              </p>
            )}
          </>
        )}

        {report && (
          <div ref={reportRef}>
            <ReportOutput
              report={report}
              copied={copied}
              copy={copy}
              reset={reset}
            />
          </div>
        )}
      </div>
    </div>
  );
}
