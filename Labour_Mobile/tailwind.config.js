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
          50: '#FDF2F3',
          100: '#FBE8EA',
          200: '#F5C6CB',
          600: '#A31C2D',
          700: '#7A1521',
          800: '#65101A',
          900: '#480A11',
        },
        primary: {
          DEFAULT: '#58000f',
          container: '#7a1521',
          fixed: '#ffdad9',
          'fixed-dim': '#ffb3b2',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#ff8487',
          fixed: '#410009',
          'fixed-variant': '#861f29',
        },
        secondary: {
          DEFAULT: '#5c5f61',
          container: '#e0e3e5',
          fixed: '#e0e3e5',
          'fixed-dim': '#c4c7c9',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#626567',
          fixed: '#191c1e',
          'fixed-variant': '#444749',
        },
        tertiary: {
          DEFAULT: '#262829',
          container: '#3c3e3e',
        },
        surface: {
          DEFAULT: '#fff8f7',
          dim: '#ead5d4',
          bright: '#fff8f7',
          container: {
            lowest: '#ffffff',
            low: '#fff0ef',
            DEFAULT: '#ffe9e8',
            high: '#f9e3e2',
            highest: '#f3dedd',
          },
          variant: '#f3dedd',
          tint: '#a7373e',
        },
        'on-surface': {
          DEFAULT: '#241919',
          variant: '#574141',
        },
        'inverse-surface': '#3a2d2d',
        'inverse-on-surface': '#ffedec',
        'inverse-primary': '#ffb3b2',
        outline: {
          DEFAULT: '#8a7170',
          variant: '#debfbf',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
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
