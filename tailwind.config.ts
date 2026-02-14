import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        darkest: '#0a0a0f',
        card: '#141416',
        elevated: '#1c1c20',
        'accent-primary': '#ffbf00',
        'accent-secondary': '#00ffd5',
        'accent-tertiary': '#a78bfa',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        'text-primary': '#e0e0e0',
        'text-secondary': '#999999',
        'text-muted': '#666666',
        'agent-johnny': '#ffbf00',
        'agent-claude': '#00ffd5',
        'agent-replit': '#a78bfa',
        'agent-lovable': '#ec4899',
        'agent-petro': '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
} satisfies Config;
