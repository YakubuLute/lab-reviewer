import { useState } from 'react';

interface Props {
  onLogin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onGoRegister: () => void;
}

export default function LoginView({ onLogin, onGoRegister }: Props) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const result = await onLogin(email, password);
    if (!result.ok) { setError(result.error ?? 'Sign-in failed.'); setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--sans)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 18, boxShadow: '0 8px 40px rgba(20,24,29,.1)', overflow: 'hidden' }}>

          {/* Brand header */}
          <div style={{ background: '#15181D', padding: '28px 32px 26px', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle radial glow */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 200px at 10% 0%, rgba(242,107,33,.2), transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Logo icon */}
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(242,107,33,.4)', flexShrink: 0 }}>
                <div style={{ width: 17, height: 17, border: '2.5px solid #fff', borderRadius: '50%', position: 'relative' }}>
                  <div style={{ position: 'absolute', width: 6, height: 3, background: '#fff', right: -5, bottom: -1.5, transform: 'rotate(45deg)', borderRadius: 2 }} />
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-.02em', color: '#fff', lineHeight: 1 }}>LabLens</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,.45)', letterSpacing: '.1em', marginTop: 3 }}>AMALITECH · NSP ASSESSMENT</div>
              </div>
            </div>
            <p style={{ position: 'relative', fontSize: 13, color: 'rgba(255,255,255,.55)', margin: '14px 0 0', lineHeight: 1.5 }}>
              Score · Assist · Analyze · Report
            </p>
          </div>

          {/* Form body */}
          <div style={{ padding: '28px 32px 32px' }}>
            <h1 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em', margin: '0 0 4px', color: 'var(--ink)' }}>Welcome back</h1>
            <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 24px' }}>Sign in to your trainer account.</p>

            {/* Error banner */}
            {error && (
              <div style={{ background: 'var(--red-t)', border: '1px solid rgba(217,67,74,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@amalitech.org"
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 600, padding: '2px 4px' }}
                  >
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: loading ? 'var(--line2)' : 'var(--orange)', color: loading ? 'var(--ink3)' : '#fff', border: 'none', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', marginTop: 4, boxShadow: loading ? 'none' : '0 3px 10px rgba(242,107,33,.28)', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'll-spin .7s linear infinite', display: 'inline-block' }} />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {/* Switch to register */}
            <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '20px 0 0', textAlign: 'center' }}>
              Don't have an account?{' '}
              <button
                onClick={onGoRegister}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange-d)', fontWeight: 600, fontSize: 13, fontFamily: 'var(--sans)', padding: 0 }}
              >
                Create one
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

// ── Shared field styles ────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)',
  marginBottom: 6, letterSpacing: '.01em',
};

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid var(--line)', borderRadius: 10,
  padding: '10px 13px', fontSize: 13.5, fontFamily: 'var(--sans)',
  color: 'var(--ink)', background: '#fff', outline: 'none',
  transition: 'border-color .12s', boxSizing: 'border-box',
};
