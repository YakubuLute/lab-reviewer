import { useState } from 'react';
import { TRACKS, COHORT_PROGRAMS, type Track } from '../data/cohorts';

interface Props {
  onCreate: (name: string, track: string) => void;
  onClose: () => void;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // last year → 3 years ahead

const fieldStyle = (err: boolean): React.CSSProperties => ({
  width: '100%', border: `1px solid ${err ? 'var(--red)' : 'var(--line)'}`,
  borderRadius: 10, padding: '10px 13px', fontSize: 13.5,
  fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .12s', background: '#fff',
});

const selectStyle = (err: boolean, empty: boolean): React.CSSProperties => ({
  ...fieldStyle(err),
  padding: '10px 36px 10px 13px',
  appearance: 'none',
  color: empty ? 'var(--ink3)' : 'var(--ink)',
  cursor: 'pointer',
});

export default function CreateCohortModal({ onCreate, onClose }: Props) {
  const [program, setProgram]       = useState('');
  const [year, setYear]             = useState(String(currentYear));
  const [customName, setCustomName] = useState('');
  const [track, setTrack]           = useState<Track | ''>('');

  const [programErr, setProgramErr]     = useState('');
  const [customNameErr, setCustomNameErr] = useState('');
  const [trackErr, setTrackErr]         = useState('');

  const isOther = program === 'other';

  const composedName = isOther
    ? customName.trim()
    : program ? `${program} ${year}` : '';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let ok = true;

    if (!program) {
      setProgramErr('Please select a program'); ok = false;
    } else setProgramErr('');

    if (isOther && !customName.trim()) {
      setCustomNameErr('Required'); ok = false;
    } else setCustomNameErr('');

    if (!track) {
      setTrackErr('Please select a track'); ok = false;
    } else setTrackErr('');

    if (!ok) return;
    onCreate(composedName, track as Track);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(20,24,29,.45)', zIndex: 200, backdropFilter: 'blur(2px)' }}
      />

      {/* Dialog */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 201, width: '100%', maxWidth: 480, padding: '0 16px',
      }}>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, boxShadow: '0 20px 60px rgba(20,24,29,.18)', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--line2)' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.015em' }}>Create a cohort</div>
              <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>A cohort holds your learner roster, labs, and review history.</div>
            </div>
            <button
              onClick={onClose}
              style={{ flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 18, lineHeight: 1, padding: '4px 6px', borderRadius: 6 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--line2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Program + Year row */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6, letterSpacing: '.01em' }}>
                Program
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: isOther ? '1fr' : '1fr 110px', gap: 10 }}>

                {/* Program dropdown */}
                <div style={{ position: 'relative' }}>
                  <select
                    value={program}
                    onChange={(e) => { setProgram(e.target.value); setProgramErr(''); setCustomNameErr(''); }}
                    style={selectStyle(!!programErr, !program)}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = programErr ? 'var(--red)' : 'var(--line)'; }}
                  >
                    <option value="">— Select program —</option>
                    {COHORT_PROGRAMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="other">Other…</option>
                  </select>
                  <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: 'var(--ink3)' }}>▼</span>
                </div>

                {/* Year dropdown — hidden when Other */}
                {!isOther && (
                  <div style={{ position: 'relative' }}>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={selectStyle(false, false)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; }}
                      onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                    <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: 'var(--ink3)' }}>▼</span>
                  </div>
                )}
              </div>
              {programErr && <div style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 5, fontWeight: 500 }}>{programErr}</div>}

              {/* Custom name input — shown when Other */}
              {isOther && (
                <div style={{ marginTop: 10 }}>
                  <input
                    autoFocus
                    value={customName}
                    onChange={(e) => { setCustomName(e.target.value); setCustomNameErr(''); }}
                    placeholder="e.g. Partner Bootcamp 2026"
                    style={fieldStyle(!!customNameErr)}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = customNameErr ? 'var(--red)' : 'var(--line)'; }}
                  />
                  {customNameErr && <div style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 5, fontWeight: 500 }}>{customNameErr}</div>}
                </div>
              )}

              {/* Preview */}
              {composedName && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink3)' }}>
                  Name: <strong style={{ color: 'var(--ink)' }}>{composedName}</strong>
                </div>
              )}
            </div>

            {/* Track */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6, letterSpacing: '.01em' }}>
                Track
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={track}
                  onChange={(e) => { setTrack(e.target.value as Track); setTrackErr(''); }}
                  style={selectStyle(!!trackErr, !track)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = trackErr ? 'var(--red)' : 'var(--line)'; }}
                >
                  <option value="">— Select a track —</option>
                  {TRACKS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: 'var(--ink3)' }}>▼</span>
              </div>
              {trackErr && <div style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 5, fontWeight: 500 }}>{trackErr}</div>}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink2)', padding: '11px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 2, background: 'var(--orange)', color: '#fff', border: 'none', padding: '11px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 3px 10px rgba(242,107,33,.28)' }}
              >
                Create cohort
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
