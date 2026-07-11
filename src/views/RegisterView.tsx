import { useState } from 'react';
import { TRAINER_ROLES, ROLE_SPECIALIZATION, type TrainerRole } from '../auth/useAuth';

interface Props {
  onRegister: (
    firstName: string, lastName: string, email: string,
    role: TrainerRole, password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  onGoLogin: () => void;
}

// ── Role chip colours ──────────────────────────────────────────────────────

const ROLE_CHIP: Record<TrainerRole, { bg: string; fg: string }> = {
  'Backend Trainer':  { bg: '#E2ECFB', fg: '#2A57C9' },
  'Frontend Trainer': { bg: '#E3F4EB', fg: '#15824E' },
  'DevOps Trainer':   { bg: '#EFE9FB', fg: '#6B46C1' },
  'UI/UX Trainer':    { bg: '#FBF0DA', fg: '#9A6B0C' },
  'QA Trainer':       { bg: '#FCE7D8', fg: '#C2530B' },
};

// ── Component ─────────────────────────────────────────────────────────────

export default function RegisterView({ onRegister, onGoLogin }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [role,      setRole]      = useState<TrainerRole | ''>('');
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(false);

  const specialization = role ? ROLE_SPECIALIZATION[role] : null;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Required';
    if (!lastName.trim())  errs.lastName  = 'Required';
    if (!email.trim())     errs.email     = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!role)             errs.role      = 'Please select your role';
    if (!password)         errs.password  = 'Required';
    else if (password.length < 8) errs.password = 'At least 8 characters';
    if (password !== confirmPw) errs.confirmPw = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    const result = await onRegister(firstName, lastName, email, role as TrainerRole, password);
    if (!result.ok) { setError(result.error ?? 'Registration failed.'); setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: 'var(--sans)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 18, boxShadow: '0 8px 40px rgba(20,24,29,.1)', overflow: 'hidden' }}>

          {/* Brand header */}
          <div style={{ background: '#15181D', padding: '24px 32px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 200px at 10% 0%, rgba(242,107,33,.2), transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(242,107,33,.4)', flexShrink: 0 }}>
                <div style={{ width: 15, height: 15, border: '2.5px solid #fff', borderRadius: '50%', position: 'relative' }}>
                  <div style={{ position: 'absolute', width: 5, height: 2.5, background: '#fff', right: -4.5, bottom: -1.5, transform: 'rotate(45deg)', borderRadius: 2 }} />
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.02em', color: '#fff', lineHeight: 1 }}>LabLens</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', marginTop: 3 }}>AMALITECH · NSP ASSESSMENT</div>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div style={{ padding: '26px 32px 32px' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em', margin: '0 0 4px', color: 'var(--ink)' }}>Create your account</h1>
            <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 22px' }}>Join LabLens as a trainer. You'll be able to sign in with Amalitech SSO once it's configured.</p>

            {/* Error banner */}
            {error && (
              <div style={{ background: 'var(--red-t)', border: '1px solid rgba(217,67,74,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="First name" error={fieldErrors.firstName}>
                  <input
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Yakubu"
                    autoComplete="given-name"
                    style={inputStyle(!!fieldErrors.firstName)}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </Field>
                <Field label="Last name" error={fieldErrors.lastName}>
                  <input
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Lute"
                    autoComplete="family-name"
                    style={inputStyle(!!fieldErrors.lastName)}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </Field>
              </div>

              {/* Email */}
              <Field label="Work email" error={fieldErrors.email}>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@amalitech.org"
                  autoComplete="email"
                  style={inputStyle(!!fieldErrors.email)}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </Field>

              {/* Role */}
              <Field label="Your role" error={fieldErrors.role}>
                <div style={{ position: 'relative' }}>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as TrainerRole)}
                    style={{ ...inputStyle(!!fieldErrors.role), appearance: 'none', paddingRight: 36, cursor: 'pointer' }}
                    onFocus={onFocus} onBlur={onBlur}
                  >
                    <option value="">— Select your role —</option>
                    {TRAINER_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {/* Chevron */}
                  <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: 'var(--ink3)' }}>▼</span>
                </div>
              </Field>

              {/* Specialization (derived) */}
              {specialization && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink3)' }}>Specialization:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: role ? ROLE_CHIP[role as TrainerRole].bg : 'var(--line2)', color: role ? ROLE_CHIP[role as TrainerRole].fg : 'var(--ink3)' }}>
                    {specialization}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ink3)' }}>— auto-assigned from your role</span>
                </div>
              )}

              {/* Password */}
              <Field label="Password" error={fieldErrors.password} hint="Minimum 8 characters">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={{ ...inputStyle(!!fieldErrors.password), paddingRight: 52 }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600, padding: '2px 4px' }}
                  >
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </Field>

              {/* Confirm password */}
              <Field label="Confirm password" error={fieldErrors.confirmPw}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={inputStyle(!!fieldErrors.confirmPw)}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </Field>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: loading ? 'var(--line2)' : 'var(--orange)', color: loading ? 'var(--ink3)' : '#fff', border: 'none', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', marginTop: 4, boxShadow: loading ? 'none' : '0 3px 10px rgba(242,107,33,.28)', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'll-spin .7s linear infinite', display: 'inline-block' }} />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '20px 0 0', textAlign: 'center' }}>
              Already have an account?{' '}
              <button
                onClick={onGoLogin}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange-d)', fontWeight: 600, fontSize: 13, fontFamily: 'var(--sans)', padding: 0 }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink3)', marginTop: 20, fontFamily: 'var(--mono)' }}>
          AmaliTech · NSP Assessment Platform
        </p>
      </div>
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────────

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6, letterSpacing: '.01em' }}>{label}</label>
      {children}
      {hint && !error && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 5, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%', border: `1px solid ${hasError ? 'var(--red)' : 'var(--line)'}`,
    borderRadius: 10, padding: '10px 13px', fontSize: 13.5,
    fontFamily: 'var(--sans)', color: 'var(--ink)', background: '#fff',
    outline: 'none', transition: 'border-color .12s', boxSizing: 'border-box',
  };
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--orange)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--line)';
}
