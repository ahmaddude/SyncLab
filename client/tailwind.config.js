/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0b0f19',
          900: '#121826',
          850: '#1a2338',
          800: '#222d44',
        },
        line: {
          DEFAULT: '#263350',
          soft: '#1e293b',
        },
        gold: {
          DEFAULT: '#d4af37',
          hover: '#c5a059',
          dim: '#8a7328',
        },
        amber: '#fbbf24',
        coral: '#ef4444',
        emerald: '#10b981',
        brand: {
          50: '#0b0f19',
          100: '#121826',
          200: '#1a2338',
          300: '#222d44',
          400: '#263350',
          500: '#8b95a7',
          600: '#a0a8b8',
          700: '#c9d2e0',
          800: '#1a2338',
          900: '#e5e7eb',
          950: '#0b0f19',
        },
      },
    },
  },
  plugins: [],
};
