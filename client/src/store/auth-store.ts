import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../lib/types';

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'malsseum-auth',
      // localStorage로 30일 무로그인 UX 지원. JWT TTL은 서버에서 30일로 제한하고
      // CSP 헤더(server/index.ts의 helmet)로 XSS 노출면을 줄여 트레이드오프 완화.
      storage: {
        getItem: (key) => {
          const v = localStorage.getItem(key);
          return v ? JSON.parse(v) : null;
        },
        setItem: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  ),
);
