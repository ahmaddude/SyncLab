/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'system-ui', 'sans-serif'],
        heading: ['Source Serif Pro', 'Georgia', 'serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F7F8FA',
          100: '#EDEFF3',
          200: '#E5E8ED',
          300: '#D8DCE3',
          400: '#8A93A3',
          500: '#6B7385',
          600: '#3A4256',
          700: '#243759',
          800: '#1B2A4A',
          900: '#141B2D',
          950: '#0D1117',
        },
        gold: {
          400: '#C9A66B',
          500: '#B8965A',
        },
        teal: {
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
      },
    },
  },
  plugins: [],
};
