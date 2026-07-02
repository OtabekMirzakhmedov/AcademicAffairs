import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
}

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

const initialMode = getInitialTheme();
applyTheme(initialMode);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,

  toggleTheme: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ mode: next });
  },

  setTheme: (mode) => {
    applyTheme(mode);
    set({ mode });
  },
}));
