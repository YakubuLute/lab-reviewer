import { useState, useEffect, useCallback } from 'react';
import {
  getCohorts, createCohortApi, deleteCohortApi,
  addLearnerApi, updateLearnerApi, removeLearnerApi, bulkAddLearnersApi,
  addLabApi, updateLabDueApi, removeLabApi,
} from '../lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CohortLearner {
  id: string;
  name: string;
  email: string;
  done: number;
  grade: string;
  avg: number | null;
  flagged: boolean;
  bg: string;
  fg: string;
}

export interface CohortLab {
  id: string;
  name: string;
  due: string;
}

export interface Cohort {
  id: string;
  name: string;
  track: string;
  instructorId: string;
  learners: CohortLearner[];
  labs: CohortLab[];
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

export const COHORT_PROGRAMS = [
  'NSP',
  'T-Shape Program',
  'DEG Cohort',
] as const;

export type CohortProgram = typeof COHORT_PROGRAMS[number];

export const TRACKS = [
  'Backend · Node.js',
  'Frontend · React',
  'Frontend · Vue',
  'DevOps',
  'UI/UX Design',
  'QA & Testing',
  'Full-Stack',
] as const;

export type Track = typeof TRACKS[number];

export const AVATAR_PALETTE: [string, string][] = [
  ['#FCE7D8', '#C2530B'],
  ['#E2ECFB', '#2A57C9'],
  ['#E3F4EB', '#15824E'],
  ['#EFE9FB', '#6B46C1'],
  ['#FBF0DA', '#9A6B0C'],
  ['#E6F2F2', '#0E7C7B'],
  ['#FBE6E6', '#C23838'],
];

// ── Hook ───────────────────────────────────────────────────────────────────

const ACTIVE_KEY = (instructorId: string) => `lablens_active_cohort_${instructorId}`;

export function useCohorts(instructorId: string) {
  const isGuest = instructorId === '__guest__';

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(!isGuest);

  const [currentCohortId, setCurrentCohortId] = useState<string | null>(() =>
    isGuest ? null : localStorage.getItem(ACTIVE_KEY(instructorId))
  );

  // Persist active cohort selection to localStorage (UI preference only)
  useEffect(() => {
    if (isGuest) return;
    const key = ACTIVE_KEY(instructorId);
    if (currentCohortId) localStorage.setItem(key, currentCohortId);
    else localStorage.removeItem(key);
  }, [currentCohortId, instructorId, isGuest]);

  // Load cohorts from API on mount
  useEffect(() => {
    if (isGuest) return;
    let cancelled = false;
    setIsLoading(true);
    getCohorts()
      .then((data) => {
        if (cancelled) return;
        setCohorts(data);
        // If stored active cohort no longer exists, default to first
        if (currentCohortId && !data.find(c => c.id === currentCohortId)) {
          setCurrentCohortId(data[0]?.id ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('[cohorts] load failed:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

  const currentCohort = cohorts.find(c => c.id === currentCohortId) ?? cohorts[0] ?? null;

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createCohort = useCallback(async (name: string, track: string): Promise<void> => {
    const cohort = await createCohortApi(name, track);
    setCohorts(prev => [...prev, cohort]);
    setCurrentCohortId(cohort.id);
  }, []);

  const deleteCohort = useCallback(async (id: string): Promise<void> => {
    await deleteCohortApi(id);
    setCohorts(prev => prev.filter(c => c.id !== id));
    setCurrentCohortId(prev => {
      if (prev !== id) return prev;
      const remaining = cohorts.filter(c => c.id !== id);
      return remaining[0]?.id ?? null;
    });
  }, [cohorts]);

  // ── Learner mutations ─────────────────────────────────────────────────────

  const addLearner = useCallback(async (cohortId: string, name: string, email?: string): Promise<void> => {
    const currentLearnerCount = cohorts.find(c => c.id === cohortId)?.learners.length ?? 0;
    const learner = await addLearnerApi(cohortId, name, email, currentLearnerCount);
    setCohorts(prev => prev.map(c =>
      c.id === cohortId ? { ...c, learners: [...c.learners, learner] } : c
    ));
  }, [cohorts]);

  const bulkAddLearners = useCallback(async (cohortId: string, csv: string): Promise<number> => {
    const { added, learners } = await bulkAddLearnersApi(cohortId, csv);
    setCohorts(prev => prev.map(c =>
      c.id === cohortId ? { ...c, learners: [...c.learners, ...learners] } : c
    ));
    return added;
  }, []);

  const removeLearner = useCallback(async (cohortId: string, learnerId: string): Promise<void> => {
    await removeLearnerApi(cohortId, learnerId);
    setCohorts(prev => prev.map(c =>
      c.id === cohortId ? { ...c, learners: c.learners.filter(l => l.id !== learnerId) } : c
    ));
  }, []);

  const updateLearner = useCallback(async (cohortId: string, learnerId: string, patch: Partial<CohortLearner>): Promise<void> => {
    const updated = await updateLearnerApi(cohortId, learnerId, patch);
    setCohorts(prev => prev.map(c =>
      c.id === cohortId
        ? { ...c, learners: c.learners.map(l => l.id === learnerId ? { ...l, ...updated } : l) }
        : c
    ));
  }, []);

  // ── Lab mutations ─────────────────────────────────────────────────────────

  const addLab = useCallback(async (cohortId: string, name: string, due: string): Promise<void> => {
    const lab = await addLabApi(cohortId, name, due);
    setCohorts(prev => prev.map(c =>
      c.id === cohortId ? { ...c, labs: [...c.labs, lab] } : c
    ));
  }, []);

  const updateLabDue = useCallback(async (cohortId: string, labId: string, due: string): Promise<void> => {
    const updated = await updateLabDueApi(cohortId, labId, due);
    setCohorts(prev => prev.map(c =>
      c.id === cohortId
        ? { ...c, labs: c.labs.map(l => l.id === labId ? { ...l, ...updated } : l) }
        : c
    ));
  }, []);

  const removeLab = useCallback(async (cohortId: string, labId: string): Promise<void> => {
    await removeLabApi(cohortId, labId);
    setCohorts(prev => prev.map(c =>
      c.id === cohortId ? { ...c, labs: c.labs.filter(l => l.id !== labId) } : c
    ));
  }, []);

  return {
    cohorts,
    isLoading,
    currentCohort,
    currentCohortId,
    setCurrentCohortId,
    createCohort,
    deleteCohort,
    addLearner,
    bulkAddLearners,
    removeLearner,
    updateLearner,
    addLab,
    updateLabDue,
    removeLab,
  };
}
