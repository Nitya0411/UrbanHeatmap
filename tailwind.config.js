/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['"DM Sans"', 'system-ui', 'Arial', 'sans-serif'] },
      colors: { ink: '#0f2a2e' },
    },
  },
  plugins: [],
};
