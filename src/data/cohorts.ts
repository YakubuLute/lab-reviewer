import { useState, useEffect } from 'react';

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

const STORAGE_KEY = 'lablens_cohorts';

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCohorts(instructorId: string) {
  const [cohorts, setCohorts] = useState<Cohort[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const all: Cohort[] = JSON.parse(raw);
      return all.filter((c) => c.instructorId === instructorId);
    } catch {
      return [];
    }
  });

  const [currentCohortId, setCurrentCohortId] = useState<string | null>(() => {
    const key = `lablens_active_cohort_${instructorId}`;
    return localStorage.getItem(key);
  });

  // Persist to localStorage whenever cohorts change
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all: Cohort[] = raw ? JSON.parse(raw) : [];
      // Replace instructor's cohorts in the global store
      const others = all.filter((c) => c.instructorId !== instructorId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, ...cohorts]));
    } catch {
      // ignore
    }
  }, [cohorts, instructorId]);

  // Persist active cohort selection
  useEffect(() => {
    const key = `lablens_active_cohort_${instructorId}`;
    if (currentCohortId) localStorage.setItem(key, currentCohortId);
    else localStorage.removeItem(key);
  }, [currentCohortId, instructorId]);

  const currentCohort = cohorts.find((c) => c.id === currentCohortId) ?? cohorts[0] ?? null;

  // ── Mutations ─────────────────────────────────────────────────────────────

  function createCohort(name: string, track: string): Cohort {
    const cohort: Cohort = {
      id: 'c' + Date.now(),
      name,
      track,
      instructorId,
      learners: [],
      labs: [],
      createdAt: new Date().toISOString(),
    };
    setCohorts((prev) => [...prev, cohort]);
    setCurrentCohortId(cohort.id);
    return cohort;
  }

  function updateCohort(id: string, fn: (c: Cohort) => Cohort) {
    setCohorts((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }

  function deleteCohort(id: string) {
    setCohorts((prev) => prev.filter((c) => c.id !== id));
    if (currentCohortId === id) {
      const remaining = cohorts.filter((c) => c.id !== id);
      setCurrentCohortId(remaining[0]?.id ?? null);
    }
  }

  // ── Learner mutations ─────────────────────────────────────────────────────

  function addLearner(cohortId: string, name: string, email?: string) {
    const palette = AVATAR_PALETTE;
    updateCohort(cohortId, (c) => {
      const [bg, fg] = palette[c.learners.length % palette.length] as [string, string];
      const resolvedEmail = email?.trim() ||
        name.toLowerCase().split(/\s+/).slice(0, 2).join('.') + '@amalitech.org';
      const learner: CohortLearner = {
        id: 'l' + Date.now(),
        name,
        email: resolvedEmail,
        done: 0,
        grade: 'New',
        avg: null,
        flagged: false,
        bg,
        fg,
      };
      return { ...c, learners: [...c.learners, learner] };
    });
  }

  function removeLearner(cohortId: string, learnerId: string) {
    updateCohort(cohortId, (c) => ({
      ...c,
      learners: c.learners.filter((l) => l.id !== learnerId),
    }));
  }

  function updateLearner(cohortId: string, learnerId: string, patch: Partial<CohortLearner>) {
    updateCohort(cohortId, (c) => ({
      ...c,
      learners: c.learners.map((l) => (l.id === learnerId ? { ...l, ...patch } : l)),
    }));
  }

  // ── Lab mutations ─────────────────────────────────────────────────────────

  function addLab(cohortId: string, name: string, due: string) {
    updateCohort(cohortId, (c) => ({
      ...c,
      labs: [...c.labs, { id: 'lab' + Date.now(), name, due }],
    }));
  }

  function updateLabDue(cohortId: string, labId: string, due: string) {
    updateCohort(cohortId, (c) => ({
      ...c,
      labs: c.labs.map((l) => (l.id === labId ? { ...l, due } : l)),
    }));
  }

  function removeLab(cohortId: string, labId: string) {
    updateCohort(cohortId, (c) => ({
      ...c,
      labs: c.labs.filter((l) => l.id !== labId),
    }));
  }

  return {
    cohorts,
    currentCohort,
    currentCohortId,
    setCurrentCohortId,
    createCohort,
    deleteCohort,
    addLearner,
    removeLearner,
    updateLearner,
    addLab,
    updateLabDue,
    removeLab,
  };
}
