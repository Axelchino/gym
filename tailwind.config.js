/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-accent': 'var(--surface-accent)',

        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',

        // Borders
        'border-subtle': 'var(--border-subtle)',
        'border-light': 'var(--border-light)',
        'border-medium': 'var(--border-medium)',

        // Brand colors
        'brand-purple': 'var(--color-purple)',
        'brand-blue': 'var(--color-blue)',
        'brand-gold': 'var(--color-gold)',

        // Keep old primary colors for backward compatibility
        primary: {
          blue: 'var(--color-blue)',
          purple: 'var(--color-purple)',
          green: '#10b981',
          yellow: '#fbbf24',
          red: '#ef4444',
        },
      },
      backgroundColor: {
        'card': 'var(--card-bg)',
        'stats': 'var(--stats-bg)',
      },
      borderColor: {
        'card': 'var(--border-subtle)',
        'DEFAULT': 'var(--border-medium)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
    },
  },
  plugins: [],
}
