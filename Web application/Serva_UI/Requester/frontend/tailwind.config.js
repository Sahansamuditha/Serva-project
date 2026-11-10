/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          maroon: '#7a1521',
          'maroon-dark': '#58000f',
          'maroon-light': '#a7373e',
          'maroon-bg': '#ffe9e8',
          'maroon-surface': '#fff0ef',
          'maroon-hover': '#6b121c',
        },
        surface: {
          DEFAULT: '#fff8f7',
          dim: '#ead5d4',
          bright: '#fff8f7',
          lowest: '#ffffff',
          low: '#fff0ef',
          container: '#ffe9e8',
          high: '#f9e3e2',
          highest: '#f3dedd',
          variant: '#f3dedd'
        },
        sidebar: {
          bg: '#7a1521',
          hover: '#67101a',
          active: '#58000f',
          text: '#ffffff',
          'text-dim': 'rgba(255, 255, 255, 0.7)'
        },
        status: {
          critical: '#ba1a1a',
          'critical-bg': '#ffdad6',
          'critical-text': '#93000a',
          pending: '#d97706',
          'pending-bg': '#fef3c7',
          'pending-text': '#92400e',
          inprogress: '#2563eb',
          'inprogress-bg': '#dbeafe',
          'inprogress-text': '#1e40af',
          completed: '#059669',
          'completed-bg': '#d1fae5',
          'completed-text': '#065f46',
          scheduled: '#0284c7',
          'scheduled-bg': '#e0f2fe',
          'scheduled-text': '#0369a1',
          low: '#64748b',
          'low-bg': '#f1f5f9',
          'low-text': '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 4px 6px rgba(0, 0, 0, 0.02)',
        'modal': '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'maroon-glow': '0 0 0 3px rgba(122, 21, 33, 0.12)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
