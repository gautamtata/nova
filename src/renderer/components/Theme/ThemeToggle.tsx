import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore, type Theme } from '@/lib/store';

const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun size={14} />, label: 'Light' },
  { value: 'dark', icon: <Moon size={14} />, label: 'Dark' },
  { value: 'system', icon: <Monitor size={14} />, label: 'System' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useAppStore();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          title={t.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: theme === t.value ? 'var(--color-surface)' : 'transparent',
            color: theme === t.value ? 'var(--color-text)' : 'var(--color-text-tertiary)',
            boxShadow: theme === t.value ? 'var(--shadow-sm)' : 'none',
          }}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
