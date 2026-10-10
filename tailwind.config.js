/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF5EA',
        card: '#FFFDF8',
        ink: '#2A2019',
        soft: '#6B5B4B',
        line: '#E8DCC6',
        rule: '#DCE6EC',
        margin: '#EBC4BB',
        mustard: { DEFAULT: '#F2B705', dark: '#C8920A', light: '#FFF1C7' },
        sale: '#2F6B45',
        expense: '#5C4A3A',
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"Atkinson Hyperlegible Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
