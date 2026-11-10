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
        brand: {
          50: '#fff0ef',
          100: '#ffe9e8',
          200: '#ffdad9',
          500: '#931d2b',
          600: '#7a1521',
          700: '#7a1521',
          800: '#58000f',
          900: '#410009',
        },
        primary: {
          DEFAULT: '#7a1521',
          dark: '#58000f',
          hover: '#931d2b',
          light: '#fff0ef',
          container: '#ffe9e8',
          fixed: '#ffdad9',
          'fixed-dim': '#ffb3b2',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#7a1521',
          fixed: '#410009',
          'fixed-variant': '#58000f',
        },
        secondary: {
          DEFAULT: '#475569',
          container: '#f1f5f9',
          fixed: '#f1f5f9',
          'fixed-dim': '#e2e8f0',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#1e293b',
          fixed: '#1e293b',
          'fixed-variant': '#475569',
        },
        tertiary: {
          DEFAULT: '#1e293b',
          container: '#334155',
        },
        surface: {
          DEFAULT: '#ffffff',
          dim: '#f1f5f9',
          bright: '#ffffff',
          container: {
            lowest: '#ffffff',
            low: '#f8fafc',
            DEFAULT: '#f1f5f9',
            high: '#e2e8f0',
            highest: '#cbd5e1',
          },
          variant: '#f1f5f9',
          tint: '#7a1521',
        },
        'on-surface': {
          DEFAULT: '#1e293b',
          variant: '#475569',
        },
        'inverse-surface': '#1e293b',
        'inverse-on-surface': '#f8fafc',
        'inverse-primary': '#ffdad9',
        outline: {
          DEFAULT: '#64748b',
          variant: '#e2e8f0',
        },
        error: {
          DEFAULT: '#dc2626',
          container: '#fee2e2',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#991b1b',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'base': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'gutter': '24px',
        'margin-mobile': '16px',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'sticky': '0 -4px 16px -2px rgba(0, 0, 0, 0.06)',
        'soft': '0 1px 8px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
