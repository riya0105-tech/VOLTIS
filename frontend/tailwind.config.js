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
        industrial: {
          950: '#070a10',
          900: '#0c111d',
          850: '#101726',
          800: '#162033',
          750: '#1d2a44',
          700: '#253556',
          600: '#33476f',
          500: '#475569',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        voltis: {
          cyan: '#00e5ff',
          neonGreen: '#00ff88',
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ff3366',
          red: '#ef4444',
          blue: '#3b82f6',
          indigo: '#6366f1',
          teal: '#14b8a6',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.45)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow-red': 'pulseRed 2s ease-in-out infinite',
        'pulse-glow-cyan': 'pulseCyan 2.5s ease-in-out infinite',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 25px 2px rgba(239, 68, 68, 0.5)', borderColor: 'rgba(239, 68, 68, 0.8)' },
          '50%': { boxShadow: '0 0 10px 0px rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' },
        },
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 20px 2px rgba(6, 182, 212, 0.4)', borderColor: 'rgba(6, 182, 212, 0.7)' },
          '50%': { boxShadow: '0 0 8px 0px rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
