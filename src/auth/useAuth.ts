import { useState, useCallback, useEffect } from 'react';
import { authRegister, authLogin, authMe, setToken, clearToken, getToken } from '../lib/api';

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

// ── Token helpers ──────────────────────────────────────────────────────────

const USER_KEY = 'lablens_user';

function loadCachedUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); } catch { return null; }
}

function saveUserCache(u: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

function clearUserCache() {
  localStorage.removeItem(USER_KEY);
}

// Decode JWT payload without verifying (client-side check for expiry only)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      clearToken();
      clearUserCache();
      return null;
    }
    return loadCachedUser();
  });

  // Verify token with server on mount (catches revoked / rotated keys)
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    authMe()
      .then((freshUser) => {
        saveUserCache(freshUser);
        setUser(freshUser);
      })
      .catch(() => {
        clearToken();
        clearUserCache();
        setUser(null);
      });
  }, []);

  const register = useCallback(async (
    firstName: string,
    lastName: string,
    email: string,
    role: TrainerRole,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { token, user: newUser } = await authRegister(firstName, lastName, email, role, password);
      setToken(token);
      saveUserCache(newUser);
      setUser(newUser);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }, []);

  const login = useCallback(async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { token, user: loggedIn } = await authLogin(email, password);
      setToken(token);
      saveUserCache(loggedIn);
      setUser(loggedIn);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearUserCache();
    setUser(null);
  }, []);

  return { user, register, login, logout };
}
