import { useState } from 'react';
import { TRACKS, type Track } from '../data/cohorts';

interface Props {
  onCreate: (name: string, track: string) => void;
  onClose: () => void;
}

export default function CreateCohortModal({ onCreate, onClose }: Props) {
  const [name, setName] = useState('');
  const [track, setTrack] = useState<Track | ''>('');
  const [nameErr, setNameErr] = useState('');
  const [trackErr, setTrackErr] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let ok = true;
    if (!name.trim()) { setNameErr('Required'); ok = false; }
    else setNameErr('');
    if (!track) { setTrackErr('Please select a track'); ok = false; }
    else setTrackErr('');
    if (!ok) return;
    onCreate(name.trim(), track as Track);
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

            {/* Cohort name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6, letterSpacing: '.01em' }}>
                Cohort name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NSP 2026 — Backend"
                style={{
                  width: '100%', border: `1px solid ${nameErr ? 'var(--red)' : 'var(--line)'}`,
                  borderRadius: 10, padding: '10px 13px', fontSize: 13.5,
                  fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color .12s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = nameErr ? 'var(--red)' : 'var(--line)'; }}
              />
              {nameErr && <div style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 5, fontWeight: 500 }}>{nameErr}</div>}
            </div>

            {/* Track */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6, letterSpacing: '.01em' }}>
                Track
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value as Track)}
                  style={{
                    width: '100%', border: `1px solid ${trackErr ? 'var(--red)' : 'var(--line)'}`,
                    borderRadius: 10, padding: '10px 36px 10px 13px', fontSize: 13.5,
                    fontFamily: 'var(--sans)', color: track ? 'var(--ink)' : 'var(--ink3)',
                    outline: 'none', appearance: 'none', background: '#fff',
                    boxSizing: 'border-box', cursor: 'pointer', transition: 'border-color .12s',
                  }}
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
