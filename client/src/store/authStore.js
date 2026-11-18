import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      isAdmin: () => get().user?.role === 'admin',
      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);

