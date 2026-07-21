/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { brand: { 50: '#eef8ff', 500: '#1889d6', 600: '#0876bf', 900: '#08395e' } }, boxShadow: { soft: '0 10px 35px rgb(15 23 42 / .10)' } } },
  plugins: []
};
