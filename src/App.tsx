import { useState, useEffect } from 'react';
import { getReviews, type Review } from './lib/api';
import { useAuth } from './auth/useAuth';
import { useCohorts } from './data/cohorts';
import useReviewForm from './hooks/useReviewForm';
import Sidebar, { View } from './components/Sidebar';
import CreateCohortModal from './components/CreateCohortModal';
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

function NoCohortPlaceholder({ onCreateCohort }: { onCreateCohort: () => void }) {
  return (
    <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 40px', textAlign: 'center' }}>
      <div style={{ background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 16, padding: '52px 40px', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>📋</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>No cohort yet</div>
        <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 22px', lineHeight: 1.6 }}>
          Create your first cohort to start managing learners, labs, and reviews.
        </p>
        <button
          onClick={onCreateCohort}
          style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 3px 10px rgba(242,107,33,.28)' }}
        >
          + Create cohort
        </button>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const { user, register, login, logout } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<View>('today');
  const [createCohortOpen, setCreateCohortOpen] = useState(false);
  // cohorts is always called but only used when user is present
  const cohortsCtx = useCohorts(user?.id ?? '__guest__');
  const form = useReviewForm(cohortsCtx.currentCohort?.learners ?? []);

  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    if (!user) return;
    getReviews().then(setReviews).catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const { cohorts, currentCohort, setCurrentCohortId, createCohort, addLearner, removeLearner, addLab, updateLabDue, removeLab } = cohortsCtx;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {createCohortOpen && (
        <CreateCohortModal
          onCreate={(name, track) => createCohort(name, track)}
          onClose={() => setCreateCohortOpen(false)}
        />
      )}
      <Sidebar
        activeView={activeView}
        setView={setActiveView}
        user={user}
        onLogout={logout}
        cohorts={cohorts}
        currentCohort={currentCohort}
        onSelectCohort={setCurrentCohortId}
        onCreateCohort={() => setCreateCohortOpen(true)}
      />

      <main style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>

        {activeView === 'today' && (
          <MyDayView
            firstName={user.firstName}
            cohorts={cohorts}
            reviews={reviews}
            onStartReview={startReview}
            onSelectCohort={(id) => { setCurrentCohortId(id); setActiveView('dashboard'); }}
            onCreateCohort={() => setCreateCohortOpen(true)}
          />
        )}

        {activeView === 'dashboard' && (
          currentCohort ? (
            <CohortDashboardView
              cohort={currentCohort}
              firstName={user.firstName}
              onNewReview={() => setActiveView('workspace')}
              onAddLearner={(name, email) => addLearner(currentCohort.id, name, email)}
              onRemoveLearner={(lid) => removeLearner(currentCohort.id, lid)}
              onAddLab={(name, due) => addLab(currentCohort.id, name, due)}
              onUpdateLabDue={(labId, due) => updateLabDue(currentCohort.id, labId, due)}
              onRemoveLab={(labId) => removeLab(currentCohort.id, labId)}
            />
          ) : (
            <NoCohortPlaceholder onCreateCohort={() => setCreateCohortOpen(true)} />
          )
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
                  ccEmail={form.ccEmail}
                  onCcEmailChange={form.setCcEmail}
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
