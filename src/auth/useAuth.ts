import { useState, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

export type TrainerRole =
  | 'Frontend Trainer'
  | 'Backend Trainer'
  | 'DevOps Trainer'
  | 'UI/UX Trainer'
  | 'QA Trainer';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: TrainerRole;
  specialization: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

export const TRAINER_ROLES: TrainerRole[] = [
  'Backend Trainer',
  'Frontend Trainer',
  'DevOps Trainer',
  'UI/UX Trainer',
  'QA Trainer',
];

export const ROLE_SPECIALIZATION: Record<TrainerRole, string> = {
  'Backend Trainer':  'Backend · Node.js',
  'Frontend Trainer': 'Frontend · React/Vue',
  'DevOps Trainer':   'DevOps',
  'UI/UX Trainer':    'UI/UX Design',
  'QA Trainer':       'QA & Testing',
};

// ── Storage helpers ────────────────────────────────────────────────────────

const USERS_KEY   = 'lablens_users';
const CREDS_KEY   = 'lablens_creds';
const SESSION_KEY = 'lablens_session';

function loadUsers(): AuthUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); } catch { return []; }
}
function saveUsers(u: AuthUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

function loadCreds(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CREDS_KEY) ?? '{}'); } catch { return {}; }
}
function saveCreds(c: Record<string, string>) { localStorage.setItem(CREDS_KEY, JSON.stringify(c)); }

function loadSession(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); } catch { return null; }
}

// Prototype-only credential encoding.
// This will be replaced by Amalitech SSO — do NOT use in production.
function encodeCred(email: string, password: string): string {
  return btoa(encodeURIComponent(email.toLowerCase() + '\x00' + password));
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(loadSession);

  const register = useCallback((
    firstName: string,
    lastName: string,
    email: string,
    role: TrainerRole,
    password: string,
  ): { ok: boolean; error?: string } => {
    const users = loadUsers();
    const normalEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalEmail)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    const newUser: AuthUser = {
      id: 'u' + Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalEmail,
      role,
      specialization: ROLE_SPECIALIZATION[role],
    };

    saveUsers([...users, newUser]);
    saveCreds({ ...loadCreds(), [newUser.id]: encodeCred(normalEmail, password) });
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return { ok: true };
  }, []);

  const login = useCallback((
    email: string,
    password: string,
  ): { ok: boolean; error?: string } => {
    const normalEmail = email.trim().toLowerCase();
    const found = loadUsers().find((u) => u.email === normalEmail);
    if (!found) return { ok: false, error: 'No account found with this email address.' };

    if (loadCreds()[found.id] !== encodeCred(normalEmail, password)) {
      return { ok: false, error: 'Incorrect password. Please try again.' };
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    setUser(found);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, register, login, logout };
}
