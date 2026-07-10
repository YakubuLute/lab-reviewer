import { useState } from 'react';
import { useAuth } from './auth/useAuth';
import useReviewForm from './hooks/useReviewForm';
import Sidebar, { View } from './components/Sidebar';
import MyDayView from './views/MyDayView';
import CohortDashboardView from './views/CohortDashboardView';
import ReviewWorkspaceView from './views/ReviewWorkspaceView';
import LearnersView from './views/LearnersView';
import RubricsView from './views/RubricsView';
import ReportOutput from './components/ReportOutput';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';

// ── Placeholder view ───────────────────────────────────────────────────────
function PlaceholderView({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ maxWidth: 760, margin: '60px auto', padding: '0 40px', textAlign: 'center' }}>
      <div style={{ background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 16, padding: '52px 40px', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 30, color: 'var(--line2)', marginBottom: 16 }}>○</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{title}</div>
        {sub && <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0, lineHeight: 1.6 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const { user, register, login, logout } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<View>('today');
  const form = useReviewForm();

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (!user) {
    if (authScreen === 'register') {
      return (
        <RegisterView
          onRegister={register}
          onGoLogin={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <LoginView
        onLogin={login}
        onGoRegister={() => setAuthScreen('register')}
      />
    );
  }

  // ── Authenticated app ─────────────────────────────────────────────────────
  function startReview(learnerName: string, labName: string, attempt: string) {
    if (learnerName) form.handleLearnerSelect(learnerName);
    if (labName)     form.setSelectedLab(labName);
    if (attempt)     form.setAttempt(attempt);
    setActiveView('workspace');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        activeView={activeView}
        setView={setActiveView}
        user={user}
        onLogout={logout}
      />

      <main style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>

        {activeView === 'today' && (
          <MyDayView firstName={user.firstName} onStartReview={startReview} />
        )}

        {activeView === 'dashboard' && (
          <CohortDashboardView onNewReview={() => setActiveView('workspace')} />
        )}

        {activeView === 'workspace' && (
          <ReviewWorkspaceView
            form={form}
            onGoReport={() => setActiveView('report')}
          />
        )}

        {activeView === 'rubrics' && (
          <RubricsView />
        )}

        {activeView === 'report' && (
          form.report ? (
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px 70px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <button
                  onClick={() => setActiveView('workspace')}
                  style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 9, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink2)', cursor: 'pointer', fontFamily: 'var(--sans)' }}
                >
                  ← Back to workspace
                </button>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Report &amp; Send</div>
              </div>
              <div ref={form.reportRef}>
                <ReportOutput
                  report={form.report}
                  copied={form.copied}
                  copy={form.copy}
                  reset={() => { form.reset(); setActiveView('today'); }}
                  onSendEmail={form.handleSendEmail}
                  sendStatus={form.sendStatus as 'idle' | 'sending' | 'done' | 'error'}
                  sendError={form.sendError}
                />
              </div>
            </div>
          ) : (
            <PlaceholderView
              title="No report yet"
              sub="Complete a review in the Review Workspace and click Preview report to generate a report."
            />
          )
        )}

        {activeView === 'profile' && (
          <LearnersView />
        )}

      </main>
    </div>
  );
}
