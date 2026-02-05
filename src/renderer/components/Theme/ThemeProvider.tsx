import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

// Safe wrapper for electron API calls (not available in browser dev mode)
const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, setResolvedTheme } = useAppStore();

  useEffect(() => {
    const loadTheme = async () => {
      if (!electronAPI?.settings) return;
      const saved = (await electronAPI.settings.get('theme')) as string | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setTheme(saved);
      }
    };
    loadTheme();
  }, [setTheme]);

  useEffect(() => {
    const applyTheme = () => {
      let resolved: 'light' | 'dark';

      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        resolved = theme;
      }

      document.documentElement.setAttribute('data-theme', resolved);
      setResolvedTheme(resolved);
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handler);

    // Persist
    electronAPI?.settings?.set('theme', theme);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, setResolvedTheme]);

  return <>{children}</>;
}
