import { create } from 'zustand';
import type { User } from '../types';
import authService from '../services/auth.service';
import i18n from '../i18n';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (login: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromStorage: () => void;
}

function applyUserLocale(user: User | null) {
  const locale = user?.userInfo?.locale ?? 'uz';
  localStorage.setItem('locale', locale);
  i18n.changeLanguage(locale);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (login, password, rememberMe = false) => {
    const response = await authService.login({ login, password, rememberMe });
    authService.setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    applyUserLocale(response.user);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  loadUserFromStorage: () => {
    try {
      const userStr = localStorage.getItem('user');
      const token = authService.getAccessToken();

      if (userStr && token) {
        const user = JSON.parse(userStr);
        applyUserLocale(user);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      set({ isLoading: false });
    }
  },
}));
