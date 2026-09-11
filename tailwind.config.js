/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical / Healthcare Primary Teal & Slate Blue Palette
        medical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        clinical: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Clinical Decision Support Severity Spectrum
        severity: {
          critical: {
            bg: '#fef2f2',
            border: '#fecaca',
            text: '#991b1b',
            solid: '#dc2626',
            badge: '#fee2e2'
          },
          major: {
            bg: '#fff7ed',
            border: '#fed7aa',
            text: '#9a3412',
            solid: '#ea580c',
            badge: '#ffedd5'
          },
          moderate: {
            bg: '#fffbeb',
            border: '#fde68a',
            text: '#92400e',
            solid: '#d97706',
            badge: '#fef3c7'
          },
          minor: {
            bg: '#eff6ff',
            border: '#bfdbfe',
            text: '#1e40af',
            solid: '#2563eb',
            badge: '#dbeafe'
          },
          info: {
            bg: '#f8fafc',
            border: '#e2e8f0',
            text: '#475569',
            solid: '#64748b',
            badge: '#f1f5f9'
          },
          safe: {
            bg: '#f0fdf4',
            border: '#bbf7d0',
            text: '#166534',
            solid: '#16a34a',
            badge: '#dcfce7'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
        '3d': '0 12px 24px -6px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        '3d-hover': '0 20px 32px -8px rgba(13, 148, 136, 0.18), 0 8px 16px -4px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'glow-teal': '0 0 24px -2px rgba(13, 148, 136, 0.35)',
        'glow-cyan': '0 0 24px -2px rgba(6, 182, 212, 0.35)',
        'glow-rose': '0 0 24px -2px rgba(225, 29, 72, 0.35)',
        'glow-amber': '0 0 24px -2px rgba(217, 119, 6, 0.35)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
