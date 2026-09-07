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
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        obsidian: {
          900: '#0f1318',
          950: '#080b0f',
          1000: '#030507'
        },
        slate: {
          850: '#131820',
          900: '#0e1218',
          950: '#06080b'
        },
        emerald: {
          400: '#34d399',
          450: '#10b981',
          500: '#10b981',
          550: '#059669',
          600: '#059669',
        }
      },
      fontFamily: {
        heading: ["'Instrument Serif'", "Georgia", "serif"],
        body: ["'Barlow'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sans: ["'Barlow'", "'Instrument Sans'", 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'instrument-sans': ['"Instrument Sans"', 'sans-serif'],
        'instrument-serif': ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'glow-brand': '0 0 25px -4px rgba(16, 185, 129, 0.5)',
        'glow-success': '0 0 25px -4px rgba(16, 185, 129, 0.45)',
        'glow-ambient': '0 12px 36px -8px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
