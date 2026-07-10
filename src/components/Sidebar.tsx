import { getInitials } from '../data/learnerColors';

export type View = 'today' | 'dashboard' | 'workspace' | 'rubrics' | 'report' | 'profile' | 'states';

interface Props {
  activeView: View;
  setView: (v: View) => void;
  reviewerName: string;
}

// ── SVG nav icons ─────────────────────────────────────────────────────────

const IconToday = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7.5" cy="7.5" r="2.8"/>
    <line x1="7.5" y1="0.5" x2="7.5" y2="2.3"/>
    <line x1="7.5" y1="12.7" x2="7.5" y2="14.5"/>
    <line x1="0.5" y1="7.5" x2="2.3" y2="7.5"/>
    <line x1="12.7" y1="7.5" x2="14.5" y2="7.5"/>
    <line x1="2.5" y1="2.5" x2="3.7" y2="3.7"/>
    <line x1="11.3" y1="11.3" x2="12.5" y2="12.5"/>
    <line x1="12.5" y1="2.5" x2="11.3" y2="3.7"/>
    <line x1="3.7" y1="11.3" x2="2.5" y2="12.5"/>
  </svg>
);

const IconDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="5.5" height="5.5" rx="1.5"/>
    <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5"/>
    <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5"/>
    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5"/>
  </svg>
);

const IconWorkspace = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 2L13 4.5L5.5 12H3V9.5L10.5 2Z"/>
    <line x1="8.5" y1="4" x2="11" y2="6.5"/>
  </svg>
);

const IconRubrics = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="2" y1="4" x2="13" y2="4"/>
    <line x1="2" y1="7.5" x2="13" y2="7.5"/>
    <line x1="2" y1="11" x2="9" y2="11"/>
  </svg>
);

const IconReport = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 1.5h9a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1v-10a1 1 0 011-1z"/>
    <line x1="4.5" y1="5" x2="10.5" y2="5"/>
    <line x1="4.5" y1="7.5" x2="10.5" y2="7.5"/>
    <line x1="4.5" y1="10" x2="8" y2="10"/>
  </svg>
);

const IconLearners = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7.5" cy="5" r="2.8"/>
    <path d="M1.5 13.5c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
  </svg>
);

const IconStates = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 5L7.5 2L13.5 5L7.5 8L1.5 5Z"/>
    <path d="M1.5 8L7.5 11L13.5 8"/>
    <path d="M1.5 11L7.5 14L13.5 11"/>
  </svg>
);

const NAV_ITEMS: Array<{ id: View; label: string; icon: React.ReactElement }> = [
  { id: 'today',     label: 'My Day',            icon: <IconToday /> },
  { id: 'dashboard', label: 'Cohort Dashboard',  icon: <IconDashboard /> },
  { id: 'workspace', label: 'Review Workspace',  icon: <IconWorkspace /> },
  { id: 'rubrics',   label: 'Rubrics',           icon: <IconRubrics /> },
  { id: 'report',    label: 'Report & Send',     icon: <IconReport /> },
  { id: 'profile',   label: 'Learners',          icon: <IconLearners /> },
  { id: 'states',    label: 'UI States',         icon: <IconStates /> },
];

export default function Sidebar({ activeView, setView, reviewerName }: Props) {
  const displayName = reviewerName || 'Yakubu Lute';
  const initials = getInitials(displayName);

  return (
    <aside style={{
      width: 230, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Magnifying glass icon */}
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(242,107,33,.35)', flexShrink: 0 }}>
          <div style={{ width: 13, height: 13, border: '2.5px solid #fff', borderRadius: '50%', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 5, height: 2.5, background: '#fff', right: -4, bottom: -1, transform: 'rotate(45deg)', borderRadius: 2 }} />
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-.02em', lineHeight: 1, color: 'var(--ink)' }}>LabLens</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink3)', letterSpacing: '.04em', marginTop: 2 }}>ASSESSMENT</div>
        </div>
      </div>

      {/* Cohort pill */}
      <div style={{ padding: '0 12px 10px' }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 11px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink3)', letterSpacing: '.07em', marginBottom: 2 }}>COHORT</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            NSP 2026 — Backend
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                padding: '8px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: active ? 'var(--orange-t)' : 'transparent',
                color: active ? 'var(--orange-d)' : 'var(--ink2)',
                fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: 'var(--sans)',
                textAlign: 'left', transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--line2)'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* AI Analysis card */}
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ background: 'var(--orange-t)', border: '1px solid var(--orange-t2)', borderRadius: 11, padding: '13px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--orange-d)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block' }} />
            AI ANALYSIS ACTIVE
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink2)', lineHeight: 1.5, marginTop: 6 }}>
            Grounded in real code. Every suggestion is yours to confirm.
          </div>
        </div>
      </div>

      {/* User profile */}
      <div style={{ borderTop: '1px solid var(--line2)', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#15181D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--ink3)', marginTop: 1, fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Trainer · Backend (Node.js)
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
