import type { Learner } from '../../shared/types';

const _learnerNames = (import.meta.env.VITE_LEARNER_NAMES || '').split(',');
const _learnerEmails = (import.meta.env.VITE_LEARNER_EMAILS || '').split(',');

export const LEARNERS: Learner[] = _learnerNames.map((name: string, i: number) => ({
  name: name.trim(),
  email: _learnerEmails[i]?.trim() ?? '',
}));

export const EMMANUEL_EMAIL: string = import.meta.env.VITE_CC_EMAIL ?? '';
