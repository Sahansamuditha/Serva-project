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
          dark: '#58000f',
          DEFAULT: '#7a1521',
          light: '#ffdad9',
          hover: '#680f1b',
          muted: '#861f29',
          tint: '#a7373e',
          subtle: '#fff0ef'
        },
        surface: {
          base: '#fff8f7',
          card: '#ffffff',
          dim: '#ead5d4',
          container: '#f8fafc',
          variant: '#f3dedd'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0px 1px 3px rgba(0,0,0,0.05), 0px 4px 6px rgba(0,0,0,0.02)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        modal: '0px 10px 25px -3px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
