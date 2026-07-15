import React from 'react';
import { LAB_SPECIALIZATION, type Guide, type GuideQuestion, type ExtraQuestion, type KindType } from '../data/guides';

// ── Color maps ─────────────────────────────────────────────────────────────

const KIND: Record<KindType, { dot: string; accent: string; rowBg: string; tagBg: string; tagFg: string; label: string; border: string }> = {
  critical: { dot: '#D9434A', accent: '#D9434A', rowBg: '#FEF5F5', tagBg: '#FCEAEA', tagFg: '#D9434A', label: 'CRITICAL', border: 'var(--line)' },
  notable:  { dot: '#D98A0B', accent: '#D98A0B', rowBg: '#FEFAF0', tagBg: '#FBF1DC', tagFg: '#D98A0B', label: 'NOTABLE',  border: 'var(--line)' },
  concept:  { dot: '#B7BECC', accent: 'var(--line)', rowBg: '#FFFFFF', tagBg: '#F0F2F5', tagFg: '#8A93A2', label: 'CONCEPT',  border: 'var(--line)' },
};

const GAP: Record<KindType, { color: string; accent: string; bg: string }> = {
  critical: { color: '#D9434A', accent: '#D9434A', bg: '#FCEAEA' },
  notable:  { color: '#D98A0B', accent: '#D98A0B', bg: '#FBF1DC' },
  concept:  { color: '#B7BECC', accent: '#E7E9EE', bg: '#F0F2F5' },
};

// ── Question Row ───────────────────────────────────────────────────────────

interface QuestionRowProps {
  question: GuideQuestion | (ExtraQuestion & { expect?: string });
  isExtra?: boolean;
  note: string;
  done: boolean;
  skipped: boolean;
  live?: boolean;
  onNoteChange: (v: string) => void;
  onToggleDone: () => void;
  onToggleSkip: () => void;
  onRemove?: () => void;
}

function QuestionRow({ question, isExtra, note, done, skipped, live, onNoteChange, onToggleDone, onToggleSkip, onRemove }: QuestionRowProps) {
  const kind: KindType = question.kind as KindType;
  const k = KIND[kind];
  const qSize = live ? 15 : 13;
  const taMinH = live ? 58 : 52;

  let rowBg = k.rowBg;
  let borderColor = k.border;
  let accentColor = k.accent;

  if (done) {
    rowBg = 'var(--green-t)';
    borderColor = 'var(--green)';
    accentColor = 'var(--green)';
  } else if (skipped) {
    rowBg = '#FAFAFB';
    borderColor = 'var(--line)';
    accentColor = 'var(--line)';
  }

  const hasExpect = 'expect' in question && question.expect;

  return (
    <div style={{
      border: `1px solid ${borderColor}`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 11,
      background: rowBg,
      padding: live ? '14px 16px' : '12px 14px',
      marginBottom: 8,
      transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Dot */}
        <div style={{
          width: 9, height: 9, borderRadius: '50%', background: skipped ? 'var(--line)' : done ? 'var(--green)' : k.dot,
          flexShrink: 0, marginTop: qSize === 15 ? 5 : 4,
          transition: 'background 0.15s',
        }} />

        {/* Text column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Question text */}
          <p style={{ fontSize: qSize, fontWeight: 600, color: skipped ? 'var(--ink3)' : 'var(--ink)', lineHeight: 1.5, margin: '0 0 4px' }}>
            {question.text}
          </p>

          {/* Code reference */}
          {question.ref && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink3)', marginBottom: hasExpect ? 8 : 0 }}>
              <span style={{ border: '1px solid var(--line)', borderRadius: 5, padding: '1px 6px', display: 'inline-block' }}>
                grounded in: {question.ref}
              </span>
            </div>
          )}

          {/* Expected answer panel */}
          {hasExpect && !skipped && (
            <div style={{ background: k.tagBg, borderRadius: 9, padding: live ? '10px 13px' : '8px 11px', marginTop: question.ref ? 0 : 4, marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.05em', color: k.tagFg, marginBottom: 4 }}>
                ✦ EXPECTED ANSWER · what to listen for
              </div>
              <p style={{ fontSize: live ? 12.5 : 11.5, color: 'var(--ink2)', lineHeight: 1.5, margin: 0 }}>
                {'expect' in question ? question.expect : ''}
              </p>
            </div>
          )}

          {/* Note textarea or skipped message */}
          {skipped ? (
            <p style={{ fontSize: 11.5, color: 'var(--ink3)', fontStyle: 'italic', margin: 0 }}>
              Skipped — not included in reviewer notes.
            </p>
          ) : (
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder={live ? 'Capture what they said, what you observed…' : 'What did they say? What did you observe?'}
              style={{
                width: '100%', minHeight: taMinH, background: '#fff',
                border: '1px solid var(--line)', borderRadius: 9, padding: '8px 10px',
                fontSize: live ? 13.5 : 12.5, color: 'var(--ink)', fontFamily: 'var(--sans)',
                lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {/* Capture toggle */}
          <button
            onClick={onToggleDone}
            style={{
              padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all 0.15s',
              border: done ? '1px solid var(--green)' : '1px solid var(--line)',
              background: done ? 'var(--green-t)' : '#fff',
              color: done ? 'var(--green-d)' : 'var(--ink2)',
              whiteSpace: 'nowrap',
            }}
          >
            {done ? '✓ Captured' : 'Capture'}
          </button>

          {/* Skip / Remove */}
          {isExtra ? (
            <button onClick={onRemove} style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--sans)' }}>
              Remove
            </button>
          ) : (
            <button onClick={onToggleSkip} style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--sans)' }}>
              {skipped ? 'Undo' : 'Skip'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Seam (reviewer notes panel) ────────────────────────────────────────────

interface SeamProps {
  reviewerNotes: string;
  setReviewerNotes: (v: string) => void;
  answeredCount: number;
  totalCount: number;
  fullHeight?: boolean;
}

function SeamPanel({ reviewerNotes, setReviewerNotes, answeredCount, totalCount, fullHeight }: SeamProps) {
  const pct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  return (
    <div style={{ border: '1px solid var(--ai-line)', borderRadius: 13, background: 'var(--ai-t)', overflow: 'hidden' }}>
      <div style={{ padding: '11px 15px', borderBottom: '1px solid var(--ai-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ai-d)' }}>↳ Reviewer notes — what the scoring AI reads</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, background: '#fff', border: '1px solid var(--ai-line)', borderRadius: 6, padding: '2px 8px', color: 'var(--ai-d)' }}>
          {answeredCount} of {totalCount} captured
        </span>
      </div>
      {/* Progress track */}
      <div style={{ height: 5, background: '#fff', borderBottom: '1px solid var(--ai-line)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--ai)', transition: 'width 0.3s' }} />
      </div>
      {/* Textarea */}
      <div style={{ padding: '10px 12px 12px' }}>
        <textarea
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
          style={{
            width: '100%', minHeight: fullHeight ? 'calc(100vh - 320px)' : 104,
            background: '#fff', border: '1px solid var(--ai-line)', borderRadius: 10,
            padding: '10px 12px', fontSize: 12.5, color: 'var(--ink)', fontFamily: 'var(--sans)',
            lineHeight: 1.6, resize: fullHeight ? 'none' : 'vertical', boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: 10.5, color: 'var(--ai-d)', marginTop: 6 }}>
          Compiled live from your guided answers — edit freely. This is the same remarks field the AI has always used; Assist just fills it faster and keeps it grounded.
        </p>
      </div>
    </div>
  );
}

// ── Sections (shared between inline and live) ──────────────────────────────

interface SectionsProps {
  guide: Guide;
  guideNotes: Record<string, string>;
  guideDone: Record<string, boolean>;
  guideSkipped: Record<string, boolean>;
  guideExtra: ExtraQuestion[];
  newGuideQ: string;
  openSections: Record<string, boolean>;
  live?: boolean;
  setGuideNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setGuideDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setGuideSkipped: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setGuideExtra: React.Dispatch<React.SetStateAction<ExtraQuestion[]>>;
  setNewGuideQ: React.Dispatch<React.SetStateAction<string>>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

function GuideSections({
  guide, guideNotes, guideDone, guideSkipped, guideExtra, newGuideQ, openSections, live,
  setGuideNotes, setGuideDone, setGuideSkipped, setGuideExtra, setNewGuideQ, setOpenSections,
}: SectionsProps) {
  const toggleSection = (id: string) => {
    if (live) return;
    setOpenSections((p) => ({ ...p, [id]: !p[id] }));
  };

  const addExtra = () => {
    const text = newGuideQ.trim();
    if (!text) return;
    const id = `extra-${Date.now()}`;
    setGuideExtra((p) => [...p, { id, kind: 'concept', ref: '', text }]);
    setNewGuideQ('');
  };

  return (
    <>
      {/* Focus-area sections */}
      {guide.sections.map((section) => {
        const totalQ = section.questions.length;
        const answeredQ = section.questions.filter(
          (q) => !guideSkipped[q.id] && (guideNotes[q.id] ?? '').trim(),
        ).length;
        const isOpen = live || openSections[section.id];

        return (
          <div key={section.id} style={{ marginBottom: 10 }}>
            {/* Section header button */}
            <button
              onClick={() => toggleSection(section.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                border: '1px solid var(--line)', borderRadius: isOpen ? '11px 11px 0 0' : 11,
                padding: '12px 14px', background: isOpen ? '#FBFBFC' : 'var(--surface)',
                cursor: live ? 'default' : 'pointer', textAlign: 'left',
                fontFamily: 'var(--sans)', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 15, color: 'var(--ink2)' }}>{section.icon}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{section.title}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, background: 'var(--line2)', borderRadius: 6, padding: '3px 8px', color: 'var(--ink2)' }}>
                {answeredQ}/{totalQ}
              </span>
              {!live && <span style={{ fontSize: 14, color: 'var(--ink3)', marginLeft: 4 }}>{isOpen ? '–' : '+'}</span>}
            </button>

            {/* Questions */}
            {isOpen && (
              <div style={{ border: '1px solid var(--line)', borderTop: 'none', borderRadius: '0 0 11px 11px', padding: '10px 10px 6px' }}>
                {section.questions.map((q) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    note={guideNotes[q.id] ?? ''}
                    done={!!guideDone[q.id]}
                    skipped={!!guideSkipped[q.id]}
                    live={live}
                    onNoteChange={(v) => setGuideNotes((p) => ({ ...p, [q.id]: v }))}
                    onToggleDone={() => setGuideDone((p) => ({ ...p, [q.id]: !p[q.id] }))}
                    onToggleSkip={() => setGuideSkipped((p) => ({ ...p, [q.id]: !p[q.id] }))}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Instructor-added questions */}
      {guideExtra.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink2)', letterSpacing: '.06em', marginBottom: 8, marginTop: 4 }}>ADDED BY YOU</div>
          {guideExtra.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              isExtra
              note={guideNotes[q.id] ?? ''}
              done={!!guideDone[q.id]}
              skipped={!!guideSkipped[q.id]}
              live={live}
              onNoteChange={(v) => setGuideNotes((p) => ({ ...p, [q.id]: v }))}
              onToggleDone={() => setGuideDone((p) => ({ ...p, [q.id]: !p[q.id] }))}
              onToggleSkip={() => setGuideSkipped((p) => ({ ...p, [q.id]: !p[q.id] }))}
              onRemove={() => setGuideExtra((p) => p.filter((x) => x.id !== q.id))}
            />
          ))}
        </div>
      )}

      {/* Add your own question */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4, marginBottom: 4 }}>
        <input
          type="text"
          value={newGuideQ}
          onChange={(e) => setNewGuideQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addExtra(); }}
          placeholder="Add your own question…"
          style={{
            flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 9,
            padding: '9px 12px', fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--sans)',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={addExtra}
          disabled={!newGuideQ.trim()}
          style={{
            padding: '9px 15px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 600,
            cursor: newGuideQ.trim() ? 'pointer' : 'default', fontFamily: 'var(--sans)',
            background: newGuideQ.trim() ? 'var(--ink)' : 'var(--line2)',
            color: newGuideQ.trim() ? '#fff' : 'var(--ink3)',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          + Add
        </button>
      </div>
    </>
  );
}

// ── Live Session overlay ───────────────────────────────────────────────────

interface LiveSessionProps {
  guide: Guide;
  learnerName: string;
  selectedLab: string;
  reviewerNotes: string;
  setReviewerNotes: (v: string) => void;
  guideNotes: Record<string, string>;
  guideDone: Record<string, boolean>;
  guideSkipped: Record<string, boolean>;
  guideExtra: ExtraQuestion[];
  newGuideQ: string;
  openSections: Record<string, boolean>;
  setGuideNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setGuideDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setGuideSkipped: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setGuideExtra: React.Dispatch<React.SetStateAction<ExtraQuestion[]>>;
  setNewGuideQ: React.Dispatch<React.SetStateAction<string>>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onClose: () => void;
}

function LiveSession({
  guide, learnerName, selectedLab, reviewerNotes, setReviewerNotes,
  guideNotes, guideDone, guideSkipped, guideExtra, newGuideQ, openSections,
  setGuideNotes, setGuideDone, setGuideSkipped, setGuideExtra, setNewGuideQ, setOpenSections,
  onClose,
}: LiveSessionProps) {
  const specialization = LAB_SPECIALIZATION[selectedLab] ?? 'Backend';
  const gapColors = GAP[guide.gapKind];

  const totalQ = guide.sections.reduce((s, sec) => s + sec.questions.length, 0) + guideExtra.length;
  const answeredQ = guide.sections.reduce((s, sec) => s + sec.questions.filter(
    (q) => !guideSkipped[q.id] && (guideNotes[q.id] ?? '').trim()
  ).length, 0) + guideExtra.filter(
    (q) => !guideSkipped[q.id] && (guideNotes[q.id] ?? '').trim()
  ).length;
  const pct = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', animation: 'll-fade .18s',
    }}>
      {/* Top bar */}
      <div style={{
        flexShrink: 0, background: '#15181D', color: '#fff',
        padding: '13px 26px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Pulse dot + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)',
            animation: 'll-pulse 1.4s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--orange)' }}>
            LIVE SESSION
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.15)' }} />

        {/* Learner + lab */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{learnerName} · {selectedLab}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>
            {guide.stack} · {specialization}
          </div>
        </div>

        {/* Right: progress + exit */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>{answeredQ} of {totalQ} captured</div>
            <div style={{ marginTop: 4, width: 120, height: 4, background: 'rgba(255,255,255,.14)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--orange)', borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)',
              color: '#fff', padding: '9px 16px', borderRadius: 10, fontSize: 12.5,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)',
            }}
          >
            ✕ Exit session
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left col: questions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '26px 30px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Gap callout */}
            <div style={{
              border: `1px solid ${gapColors.color}`, borderLeft: `3px solid ${gapColors.accent}`,
              background: gapColors.bg, borderRadius: 12, padding: '14px 16px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: gapColors.color }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: gapColors.color }}>
                  {guide.gapKind.toUpperCase()} — THE HEADLINE OF THIS SESSION
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{guide.gapTitle}</div>
              <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>{guide.gapBody}</p>
            </div>

            {/* Strengths */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--green-d)', letterSpacing: '.06em', marginBottom: 8 }}>
                OBSERVED STRENGTHS — LEAD WITH THESE
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {guide.strengths.map((s, i) => (
                  <span key={i} style={{ fontSize: 11.5, color: 'var(--green-d)', background: 'var(--green-t)', border: '1px solid #C7EAD8', padding: '5px 11px', borderRadius: 20 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Sections (all expanded in live) */}
            <GuideSections
              guide={guide} guideNotes={guideNotes} guideDone={guideDone} guideSkipped={guideSkipped}
              guideExtra={guideExtra} newGuideQ={newGuideQ} openSections={openSections} live
              setGuideNotes={setGuideNotes} setGuideDone={setGuideDone} setGuideSkipped={setGuideSkipped}
              setGuideExtra={setGuideExtra} setNewGuideQ={setNewGuideQ} setOpenSections={setOpenSections}
            />
          </div>
        </div>

        {/* Right col: seam */}
        <div style={{
          width: 400, flexShrink: 0, borderLeft: '1px solid var(--line)',
          background: 'var(--ai-t)', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '20px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ai-d)', marginBottom: 4 }}>↳ Reviewer notes</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink2)', marginBottom: 10, lineHeight: 1.5 }}>
              What the scoring AI reads. Compiling live from your answers on the left.
            </div>
            {/* Progress */}
            <div style={{ height: 4, background: 'var(--ai-line)', borderRadius: 99, marginBottom: 10 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--ai)', borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
            {/* Textarea */}
            <textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              style={{
                flex: 1, resize: 'none', background: '#fff', border: '1px solid var(--ai-line)',
                borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: 'var(--ink)',
                fontFamily: 'var(--sans)', lineHeight: 1.6, minHeight: 0,
              }}
            />
          </div>
          {/* Done button */}
          <div style={{ padding: '0 18px 20px' }}>
            <button
              onClick={onClose}
              style={{
                width: '100%', background: 'var(--orange)', color: '#fff', border: 'none',
                padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--sans)',
              }}
            >
              Done — back to review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main card ──────────────────────────────────────────────────────────────

interface Props {
  learnerName: string;
  selectedLab: string;
  guide: Guide | null;
  guideError?: string;
  reviewerNotes: string;
  setReviewerNotes: (v: string) => void;
  assistMode: 'guided' | 'freeform';
  setAssistMode: (mode: 'guided' | 'freeform') => void;
  guideReady: boolean;
  guideGenerating: boolean;
  guideGenPct: number;
  guideNotes: Record<string, string>;
  setGuideNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  guideDone: Record<string, boolean>;
  setGuideDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  guideSkipped: Record<string, boolean>;
  setGuideSkipped: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  guideExtra: ExtraQuestion[];
  setGuideExtra: React.Dispatch<React.SetStateAction<ExtraQuestion[]>>;
  newGuideQ: string;
  setNewGuideQ: React.Dispatch<React.SetStateAction<string>>;
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  liveSession: boolean;
  setLiveSession: React.Dispatch<React.SetStateAction<boolean>>;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export default function CodeReviewAssistCard({
  learnerName, selectedLab, guide, guideError = '',
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
  onGenerate, onRegenerate,
}: Props) {
  const specialization = LAB_SPECIALIZATION[selectedLab] ?? 'Backend';

  // Totals
  const totalQ = guide
    ? guide.sections.reduce((s, sec) => s + sec.questions.length, 0) + guideExtra.length
    : 0;
  const answeredQ = guide
    ? guide.sections.reduce((s, sec) => s + sec.questions.filter(
        (q) => !guideSkipped[q.id] && (guideNotes[q.id] ?? '').trim()
      ).length, 0) + guideExtra.filter(
        (q) => !guideSkipped[q.id] && (guideNotes[q.id] ?? '').trim()
      ).length
    : 0;

  const gapColors = guide ? GAP[guide.gapKind] : GAP.notable;

  return (
    <>
      {/* Live Session overlay */}
      {liveSession && guide && (
        <LiveSession
          guide={guide}
          learnerName={learnerName}
          selectedLab={selectedLab}
          reviewerNotes={reviewerNotes}
          setReviewerNotes={setReviewerNotes}
          guideNotes={guideNotes}
          guideDone={guideDone}
          guideSkipped={guideSkipped}
          guideExtra={guideExtra}
          newGuideQ={newGuideQ}
          openSections={openSections}
          setGuideNotes={setGuideNotes}
          setGuideDone={setGuideDone}
          setGuideSkipped={setGuideSkipped}
          setGuideExtra={setGuideExtra}
          setNewGuideQ={setNewGuideQ}
          setOpenSections={setOpenSections}
          onClose={() => setLiveSession(false)}
        />
      )}

      {/* Inline card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', marginBottom: 12, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>02</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Code Review Assist</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, letterSpacing: '.06em',
            background: 'var(--ai-t)', color: 'var(--ai-d)', border: '1px solid var(--ai-line)',
            borderRadius: 6, padding: '3px 8px',
          }}>✦ AI ON-RAMP</span>

          {/* Segmented toggle — right side */}
          <div style={{ marginLeft: 'auto', background: 'var(--line2)', borderRadius: 9, padding: 3, display: 'flex', gap: 2 }}>
            {(['guided', 'freeform'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAssistMode(m)}
                style={{
                  padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', transition: 'all 0.15s',
                  background: assistMode === m ? '#fff' : 'transparent',
                  color: assistMode === m ? 'var(--ink)' : 'var(--ink3)',
                  boxShadow: assistMode === m ? '0 1px 3px rgba(20,24,29,.1)' : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ── A4. Freeform ── */}
        {assistMode === 'freeform' && (
          <div style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 10, lineHeight: 1.55 }}>
              Freeform mode — write your live-session observations directly. Switch to <strong>Guided</strong> any time for AI-generated questions grounded in the code.
            </p>
            <textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Write your observations, strengths and gaps here…"
              style={{
                width: '100%', minHeight: 120, background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--ink)',
                fontFamily: 'var(--sans)', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* ── A1. Launch ── */}
        {assistMode === 'guided' && !guideReady && !guideGenerating && (
          <div style={{ padding: '24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                  Start with a guided review
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.55, maxWidth: 460, margin: 0 }}>
                  Assist reads the submission and turns it into a short set of questions to work through live with <strong>{learnerName || 'the learner'}</strong> — adapted to {specialization}. Your answers compile straight into the reviewer notes the scoring AI reads. Recommended, but you can skip it.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={onGenerate}
                  style={{
                    background: 'var(--orange)', color: '#fff',
                    border: 'none', padding: '13px 22px', borderRadius: 11, fontSize: 13.5,
                    fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(242,107,33,.3)',
                    fontFamily: 'var(--sans)', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  ✦ Generate guided review
                </button>
                {guideError && (
                  <p style={{ fontSize: 11, color: 'var(--red)', margin: 0, textAlign: 'right', maxWidth: 260 }}>
                    {guideError}
                  </p>
                )}
                <button
                  onClick={() => setAssistMode('freeform')}
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', padding: '4px 0' }}
                >
                  Skip — write freeform notes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── A2. Generating ── */}
        {assistMode === 'guided' && guideGenerating && (
          <div style={{ padding: '26px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              {/* Spinner tile */}
              <div style={{ width: 38, height: 38, background: 'var(--ai-t)', border: '1px solid var(--ai-line)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, border: '2.5px solid var(--ai-line)', borderTop: `2.5px solid var(--ai)`, borderRadius: '50%', animation: 'll-spin .8s linear infinite' }} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                  Reading the submission &amp; adapting questions to {specialization}…
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>Grounding each question in the real code, not a template.</div>
              </div>
              <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: 'var(--ai-d)', flexShrink: 0 }}>
                {guideGenPct}%
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: 'var(--line2)', borderRadius: 99, marginTop: 16, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${guideGenPct}%`,
                background: 'linear-gradient(90deg, #5B59E0, #8785EE)',
                borderRadius: 99, transition: 'width 0.2s',
              }} />
            </div>
          </div>
        )}

        {/* ── A3. Guided (ready) ── */}
        {assistMode === 'guided' && guideReady && guide && (
          <div style={{ padding: '16px 20px 20px' }}>

            {/* Guide meta row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>Guide for {learnerName}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 600, background: 'var(--blue-t)', color: 'var(--blue)', padding: '2px 8px', borderRadius: 6 }}>
                    {guide.level}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink3)', marginBottom: 3 }}>{guide.stack}</div>
                <div style={{ fontSize: 11, color: 'var(--ink2)' }}>
                  {guide.sections.length} focus areas · {guide.sections.reduce((s, sec) => s + sec.questions.length, 0)} questions · adapted to {specialization}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={onRegenerate}
                  style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink2)', fontSize: 11.5, fontWeight: 600, padding: '7px 12px', borderRadius: 9, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                >
                  ↻ Regenerate
                </button>
                <button
                  onClick={() => { setLiveSession(true); setOpenSections({}); }}
                  style={{ background: 'var(--ink)', color: '#fff', border: 'none', fontSize: 11.5, fontWeight: 600, padding: '8px 14px', borderRadius: 9, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 2px 8px rgba(20,24,33,.18)' }}
                >
                  ▶ Start live session
                </button>
              </div>
            </div>

            {/* Live-session hint strip */}
            <div style={{ background: 'var(--line2)', borderRadius: 9, padding: '9px 13px', marginBottom: 14, fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.55 }}>
              ▶ &nbsp;Sitting down with {learnerName}? <strong>Start live session</strong> opens a focused, full-screen surface — just the guide and the notes, scoring hidden — for the conversation. Everything you capture there lands right back here.
            </div>

            {/* Critical-gap callout */}
            <div style={{
              border: `1px solid ${gapColors.color}`, borderLeft: `3px solid ${gapColors.accent}`,
              background: gapColors.bg, borderRadius: 12, padding: '14px 16px', marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: gapColors.color }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: gapColors.color }}>
                  {guide.gapKind.toUpperCase()} — THE HEADLINE OF THIS SESSION
                </span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{guide.gapTitle}</div>
              <p style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>{guide.gapBody}</p>
            </div>

            {/* Observed strengths */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--green-d)', letterSpacing: '.06em', marginBottom: 7 }}>OBSERVED STRENGTHS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {guide.strengths.map((s, i) => (
                  <span key={i} style={{ fontSize: 11.5, color: 'var(--green-d)', background: 'var(--green-t)', border: '1px solid #C7EAD8', padding: '5px 11px', borderRadius: 20 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ background: 'var(--line2)', borderRadius: 9, padding: '9px 13px', marginBottom: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {([
                { color: '#D9434A', label: 'Critical gap or real bug' },
                { color: '#D98A0B', label: 'Notable pattern worth probing' },
                { color: '#B7BECC', label: 'Concept question' },
              ] as const).map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--ink2)' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Sections */}
            <GuideSections
              guide={guide} guideNotes={guideNotes} guideDone={guideDone} guideSkipped={guideSkipped}
              guideExtra={guideExtra} newGuideQ={newGuideQ} openSections={openSections}
              setGuideNotes={setGuideNotes} setGuideDone={setGuideDone} setGuideSkipped={setGuideSkipped}
              setGuideExtra={setGuideExtra} setNewGuideQ={setNewGuideQ} setOpenSections={setOpenSections}
            />

            {/* Seam */}
            <div style={{ marginTop: 16 }}>
              <SeamPanel
                reviewerNotes={reviewerNotes}
                setReviewerNotes={setReviewerNotes}
                answeredCount={answeredQ}
                totalCount={totalQ}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
