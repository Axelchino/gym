import { useTheme } from '../contexts/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      gap: '8px',
      padding: '12px',
      background: 'var(--surface)',
      border: 'var(--card-border)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <button
        onClick={() => setTheme('light')}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: theme === 'light' ? '2px solid var(--color-purple)' : '1px solid var(--border-medium)',
          background: theme === 'light' ? 'var(--color-purple)' : 'transparent',
          color: theme === 'light' ? 'white' : 'var(--text-primary)',
          fontWeight: theme === 'light' ? 'bold' : 'normal',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: theme === 'dark' ? '2px solid var(--color-purple)' : '1px solid var(--border-medium)',
          background: theme === 'dark' ? 'var(--color-purple)' : 'transparent',
          color: theme === 'dark' ? 'white' : 'var(--text-primary)',
          fontWeight: theme === 'dark' ? 'bold' : 'normal',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        🌙 Dark
      </button>
      <button
        onClick={() => setTheme('amoled')}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: theme === 'amoled' ? '2px solid var(--text-secondary)' : '1px solid var(--border-medium)',
          background: theme === 'amoled' ? 'var(--color-gray)' : 'transparent',
          color: theme === 'amoled' ? 'white' : 'var(--text-primary)',
          fontWeight: theme === 'amoled' ? 'bold' : 'normal',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        ⬛ AMOLED
      </button>
    </div>
  );
}
