import { useState } from 'react';
import { LAB_DATA } from '../data/labs';
import { PASSING_SCORE, getWeight } from '../data/scoring';
import { learnerColor, getInitials } from '../data/learnerColors';
import CodeInputCard from '../components/CodeInputCard';
import CodeReviewAssistCard from '../components/CodeReviewAssistCard';
import CriteriaScoringCard from '../components/CriteriaScoringCard';
import RemarksCard from '../components/RemarksCard';
import ReportOutput from '../components/ReportOutput';

type FormState = {
  learnerName: string; learnerEmail: string;
  selectedLab: string; setSelectedLab: (v: string) => void;
  attempt: string; setAttempt: (v: string) => void;
  scores: Record<string, number>; setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  feedbacks: Record<string, string>; setFeedbacks: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  strengths: string; setStrengths: (v: string) => void;
  improvements: string; setImprovements: (v: string) => void;
  otherRemarks: string; setOtherRemarks: (v: string) => void;
  redoLab: boolean; setRedoLab: (v: boolean) => void;
  plagiarism: boolean; setPlagiarism: (v: boolean) => void;
  reviewerName: string; reviewDate: string;
  codeSource: 'github' | 'paste'; setCodeSource: (v: 'github' | 'paste') => void;
  repoUrl: string; setRepoUrl: (v: string) => void;
  branch: string; setBranch: (v: string) => void;
  pastedCode: string; setPastedCode: (v: string) => void;
  codeFiles: { path: string; content: string }[];
  fetchStatus: string; fetchError: string; truncatedNote: string;
  reviewerNotes: string; setReviewerNotes: (v: string) => void;
  assistMode: 'guided' | 'freeform'; setAssistMode: (mode: 'guided' | 'freeform') => void;
  guideReady: boolean; guideGenerating: boolean; guideGenPct: number;
  guideNotes: Record<string, string>; setGuideNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  guideDone: Record<string, boolean>; setGuideDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  guideSkipped: Record<string, boolean>; setGuideSkipped: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  guideExtra: { id: string; kind: 'concept'; ref: string; text: string }[];
  setGuideExtra: React.Dispatch<React.SetStateAction<{ id: string; kind: 'concept'; ref: string; text: string }[]>>;
  newGuideQ: string; setNewGuideQ: React.Dispatch<React.SetStateAction<string>>;
  openSections: Record<string, boolean>; setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  liveSession: boolean; setLiveSession: React.Dispatch<React.SetStateAction<boolean>>;
  handleGenerateGuide: () => void; handleRegenerateGuide: () => void;
  analyzeStatus: string; analyzeError: string; aiSuggested: boolean;
  lab: import('../../shared/types').Lab | null;
  totalScore: string; maxScore: number;
  grade: import('../../shared/types').GradeInfo;
  passed: boolean; isValid: boolean; canAnalyze: boolean;
  report: import('../../shared/types').Report | null;
  copied: string;
  learners: { name: string; email: string }[];
  handleLearnerSelect: (n: string) => void;
  handleFetchRepo: () => void;
  handleAnalyze: () => void;
  handleSendEmail: () => void;
  handleGenerate: () => void;
  copy: (t: string, k: string) => void;
  reset: () => void;
  reportRef: React.RefObject<HTMLDivElement | null>;
  sendStatus: string; sendError: string;
};

interface Props { form: FormState; onGoReport: () => void; }

// ── Sliding toggle ─────────────────────────────────────────────────────────
function SlideToggle({ value, onChange, onColor = 'var(--amber)' }: { value: boolean; onChange: (v: boolean) => void; onColor?: string }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ width: 36, height: 21, borderRadius: 11, flexShrink: 0, padding: 2, cursor: 'pointer', transition: 'background .15s', background: value ? onColor : 'var(--line2)' }}
    >
      <div style={{ width: 17, height: 17, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)', transform: value ? 'translateX(15px)' : 'translateX(0)', transition: 'transform .15s' }} />
    </div>
  );
}

// ── Right panel (live score + flags + action) ──────────────────────────────
function RightPanel({ form, onGoReport }: { form: FormState; onGoReport: () => void }) {
  const { totalScore, maxScore, grade, passed, attempt, lab, scores, redoLab, setRedoLab, plagiarism, setPlagiarism, isValid, canAnalyze, analyzeStatus, aiSuggested, handleAnalyze, handleGenerate, report } = form;
  const isAnalyzing = analyzeStatus === 'analyzing';
  const scorePct = maxScore > 0 ? (parseFloat(totalScore) / maxScore) * 100 : 0;
  const passPct = (PASSING_SCORE / maxScore) * 100;

  const confirmedCount = lab ? lab.criteria.filter((c) => (scores[c.id] ?? 0) > 0).length : 0;
  const critCount = lab?.criteria.length ?? 0;

  const gradeBg = passed ? 'var(--green-t)' : 'var(--red-t)';
  const gradeFg = passed ? 'var(--green-d)' : 'var(--red)';

  return (
    <div style={{ position: 'sticky', top: 78, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Live Score */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 15, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 6px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)' }}>LIVE SCORE</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 44, fontWeight: 700, letterSpacing: '-.02em', lineHeight: .9, color: 'var(--ink)' }}>{totalScore}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 20, color: 'var(--ink3)' }}>%</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: gradeBg, color: gradeFg }}>{grade.label}</span>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', marginTop: 6, color: passed ? 'var(--green-d)' : 'var(--red)' }}>
                {passed ? 'PASSED' : 'NEEDS WORK'}
              </div>
            </div>
          </div>
        </div>

        {/* Orange gradient bar with 80% pass marker */}
        <div style={{ padding: '14px 18px 16px' }}>
          <div style={{ position: 'relative', height: 13, background: 'var(--line2)', borderRadius: 7, overflow: 'visible' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 7, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(scorePct, 100)}%`, background: 'linear-gradient(90deg,var(--orange),#FF8B4A)', borderRadius: 7, transition: 'width .35s' }} />
            </div>
            {/* Pass marker */}
            <div style={{ position: 'absolute', top: -4, bottom: -4, left: `${passPct}%`, width: 2, background: 'var(--ink)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: -19, left: `${passPct}%`, transform: 'translateX(-50%)', fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>
              {PASSING_SCORE} PASS
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink3)', marginTop: 7 }}>
            <span>0</span><span>100</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--line2)', padding: '13px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--ink2)' }}>Confirmed by you</span>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{confirmedCount} / {critCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--ink2)' }}>Attempt</span>
            <span style={{ fontWeight: 600 }}>{attempt}</span>
          </div>
          {attempt === '2nd' && (
            <div style={{ fontSize: 11, color: 'var(--amber)', background: 'var(--amber-t)', padding: '8px 10px', borderRadius: 8, lineHeight: 1.5 }}>
              Re-submission cap applied — total limited to 80%.
            </div>
          )}
        </div>
      </div>

      {/* Flags */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 15, boxShadow: 'var(--shadow)', padding: '15px 18px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', marginBottom: 11 }}>FLAGS</div>
        <div onClick={() => setRedoLab(!redoLab)} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', padding: '6px 0' }}>
          <SlideToggle value={redoLab} onChange={setRedoLab} onColor="var(--amber)" />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>Re-do required</div>
            <div style={{ fontSize: 10.5, color: 'var(--ink3)' }}>Learner must resubmit this lab</div>
          </div>
        </div>
        <div onClick={() => setPlagiarism(!plagiarism)} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', padding: '6px 0' }}>
          <SlideToggle value={plagiarism} onChange={setPlagiarism} onColor="var(--red)" />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>Authorship concern</div>
            <div style={{ fontSize: 10.5, color: 'var(--ink3)' }}>Could not explain parts of the code</div>
          </div>
        </div>
      </div>

      {/* AI analysis banner */}
      {aiSuggested && (
        <div style={{ padding: '10px 14px', background: 'var(--ai-t)', border: '1px solid var(--ai-line)', borderRadius: 11, fontSize: 11.5, color: 'var(--ai-d)', lineHeight: 1.5 }}>
          <strong style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>✦ AI</strong> — Scores and comments were pre-filled by Claude. Review each field before generating.
        </div>
      )}

      {/* Analyze error */}
      {analyzeStatus === 'error' && (
        <div style={{ padding: '10px 13px', background: 'var(--red-t)', border: '1px solid rgba(217,67,74,.2)', borderRadius: 10, fontSize: 11.5, color: 'var(--red)', lineHeight: 1.5 }}>
          Analysis failed. Check network or API key.
        </div>
      )}

      {/* Analyze button */}
      {!report && (
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          style={{
            width: '100%', background: canAnalyze && !isAnalyzing ? 'var(--ai)' : 'var(--line2)',
            color: canAnalyze && !isAnalyzing ? '#fff' : 'var(--ink3)',
            border: 'none', padding: '12px', borderRadius: 11, fontSize: 13, fontWeight: 600,
            cursor: canAnalyze && !isAnalyzing ? 'pointer' : 'not-allowed', fontFamily: 'var(--sans)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .15s',
          }}
        >
          {isAnalyzing
            ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'll-spin .8s linear infinite', display: 'inline-block' }} />Analyzing…</>
            : '✦ Analyze with Claude'}
        </button>
      )}

      {/* Preview report button */}
      {!report && (
        <button
          onClick={() => { handleGenerate(); onGoReport(); }}
          disabled={!isValid}
          style={{
            width: '100%', background: isValid ? '#15181D' : 'var(--line2)',
            color: isValid ? '#fff' : 'var(--ink3)', border: 'none',
            padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            cursor: isValid ? 'pointer' : 'not-allowed', fontFamily: 'var(--sans)', transition: 'all .15s',
          }}
        >
          Preview report →
        </button>
      )}

      {report && (
        <button
          onClick={onGoReport}
          style={{ width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 3px 10px rgba(242,107,33,.3)' }}
        >
          View Report &amp; Send →
        </button>
      )}

      {!isValid && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink3)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          Nothing sends automatically. You review the full report first.
        </p>
      )}
    </div>
  );
}

// ── Context bar ────────────────────────────────────────────────────────────
function ContextBar({ form }: { form: FormState }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { learnerName, learnerEmail, selectedLab, setSelectedLab, attempt, setAttempt, handleLearnerSelect, reviewerName, reviewDate } = form;
  const { bg, fg } = learnerColor(learnerName);
  const initials = learnerName ? getInitials(learnerName) : '??';

  const now = new Date(reviewDate || Date.now());
  const dateShort = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 5,
      background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--line)', padding: '14px 40px',
      display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
    }}>
      {/* Learner picker */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'transparent', border: '1px solid var(--line)', borderRadius: 11, padding: '6px 12px 6px 7px', cursor: 'pointer', fontFamily: 'var(--sans)', textAlign: 'left' }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: learnerName ? bg : 'var(--line2)', color: learnerName ? fg : 'var(--ink3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.1, color: 'var(--ink)' }}>{learnerName || 'Select learner'}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink3)' }}>{learnerEmail || '—'}</div>
          </div>
          <span style={{ color: 'var(--ink3)', fontSize: 9, marginLeft: 4, flexShrink: 0 }}>▼</span>
        </button>

        {pickerOpen && (
          <div style={{ position: 'absolute', left: 0, top: 'calc(100% + 6px)', zIndex: 60, width: 290, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-l)', padding: 5, animation: 'll-fade .15s ease', maxHeight: 330, overflowY: 'auto' }}>
            {form.learners.map((l) => {
              const lc = learnerColor(l.name);
              const active = l.name === learnerName;
              return (
                <button
                  key={l.email}
                  onClick={() => { handleLearnerSelect(l.name); setPickerOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: active ? 'var(--orange-t)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--sans)', textAlign: 'left' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: lc.bg, color: lc.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11 }}>{getInitials(l.name)}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{l.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.email}</div>
                  </div>
                  {active && <span style={{ color: 'var(--orange)', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </button>
              );
            })}
            <div style={{ borderTop: '1px solid var(--line2)', marginTop: 4, padding: '8px 10px 5px', fontSize: 10, color: 'var(--ink3)', lineHeight: 1.5 }}>
              Switching learner starts a fresh review for the selected lab.
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 30, background: 'var(--line)', flexShrink: 0 }} />

      {/* Lab selector */}
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink3)', letterSpacing: '.04em' }}>LAB</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '6px 9px', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--ink)', background: '#fff', outline: 'none', cursor: 'pointer', maxWidth: 280 }}
          >
            <option value="">— Choose a lab —</option>
            {Object.keys(LAB_DATA).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Attempt toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink3)', letterSpacing: '.04em' }}>ATTEMPT</span>
        <div style={{ display: 'flex', background: 'var(--line2)', borderRadius: 8, padding: 3, gap: 2 }}>
          {(['1st', '2nd'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAttempt(a)}
              style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: attempt === a ? 600 : 500, background: attempt === a ? '#fff' : 'transparent', color: attempt === a ? 'var(--ink)' : 'var(--ink3)', boxShadow: attempt === a ? '0 1px 3px rgba(20,24,29,.1)' : 'none', transition: 'all .12s' }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Date + reviewer — pushed right */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--ink2)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--mono)' }}>{dateShort}</span>
        <span style={{ width: 1, height: 18, background: 'var(--line)', display: 'inline-block' }} />
        <span>Reviewer: <b style={{ fontWeight: 600, color: 'var(--ink)' }}>{reviewerName || 'Not set'}</b></span>
      </div>
    </div>
  );
}

// ── Main workspace view ────────────────────────────────────────────────────
export default function ReviewWorkspaceView({ form, onGoReport }: Props) {
  const {
    lab, selectedLab, learnerName,
    codeSource, setCodeSource, repoUrl, setRepoUrl, branch, setBranch,
    pastedCode, setPastedCode, codeFiles, fetchStatus, fetchError, truncatedNote, handleFetchRepo,
    reviewerNotes, setReviewerNotes,
    assistMode, setAssistMode, guideReady, guideGenerating, guideGenPct,
    guideNotes, setGuideNotes, guideDone, setGuideDone, guideSkipped, setGuideSkipped,
    guideExtra, setGuideExtra, newGuideQ, setNewGuideQ, openSections, setOpenSections,
    liveSession, setLiveSession, handleGenerateGuide, handleRegenerateGuide,
    scores, setScores, feedbacks, setFeedbacks,
    strengths, setStrengths, improvements, setImprovements, otherRemarks, setOtherRemarks,
    grade, totalScore, maxScore, passed,
    report, copied, copy, reset, handleSendEmail, sendStatus, sendError, reportRef,
  } = form;

  if (!selectedLab || !learnerName) {
    return (
      <>
        <ContextBar form={form} />
        <div style={{ maxWidth: 1240, margin: '40px auto', padding: '0 40px' }}>
          <div style={{ background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 14, padding: 46, textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Select a learner and lab to begin</div>
            <p style={{ fontSize: 12.5, color: 'var(--ink2)', margin: '7px 0 0', lineHeight: 1.6 }}>
              Choose a learner from the picker above, then select a lab module to open the review workspace.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ContextBar form={form} />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 40px 70px', display: 'grid', gridTemplateColumns: '1fr 332px', gap: 26, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 01 · Code Intake */}
          <CodeInputCard
            codeSource={codeSource} setCodeSource={setCodeSource}
            repoUrl={repoUrl} setRepoUrl={setRepoUrl}
            branch={branch} setBranch={setBranch}
            pastedCode={pastedCode} setPastedCode={setPastedCode}
            codeFiles={codeFiles} fetchStatus={fetchStatus as 'idle' | 'fetching' | 'done' | 'error'}
            fetchError={fetchError} truncatedNote={truncatedNote}
            onFetchRepo={handleFetchRepo}
          />

          {/* 02 · Code Review Assist */}
          <CodeReviewAssistCard
            learnerName={learnerName} selectedLab={selectedLab}
            reviewerNotes={reviewerNotes} setReviewerNotes={setReviewerNotes}
            assistMode={assistMode} setAssistMode={setAssistMode}
            guideReady={guideReady} guideGenerating={guideGenerating} guideGenPct={guideGenPct}
            guideNotes={guideNotes} setGuideNotes={setGuideNotes}
            guideDone={guideDone} setGuideDone={setGuideDone}
            guideSkipped={guideSkipped} setGuideSkipped={setGuideSkipped}
            guideExtra={guideExtra} setGuideExtra={setGuideExtra}
            newGuideQ={newGuideQ} setNewGuideQ={setNewGuideQ}
            openSections={openSections} setOpenSections={setOpenSections}
            liveSession={liveSession} setLiveSession={setLiveSession}
            onGenerate={handleGenerateGuide} onRegenerate={handleRegenerateGuide}
          />

          {/* 03 · Criteria Scoring */}
          <div id="criteria-section">
            <CriteriaScoringCard
              lab={lab!} attempt={form.attempt}
              scores={scores} setScores={setScores}
              feedbacks={feedbacks} setFeedbacks={setFeedbacks}
              totalScore={totalScore} grade={grade} maxScore={maxScore} passed={passed}
            />
          </div>

          {/* 04 · Remarks */}
          <RemarksCard
            strengths={strengths} setStrengths={setStrengths}
            improvements={improvements} setImprovements={setImprovements}
            otherRemarks={otherRemarks} setOtherRemarks={setOtherRemarks}
          />

          {/* Report (in-page for context, but main view is Report & Send) */}
          {report && (
            <div ref={reportRef}>
              <ReportOutput
                report={report} copied={copied} copy={copy} reset={reset}
                onSendEmail={handleSendEmail} sendStatus={sendStatus as 'idle' | 'sending' | 'done' | 'error'} sendError={sendError}
              />
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <RightPanel form={form} onGoReport={onGoReport} />
      </div>
    </>
  );
}
