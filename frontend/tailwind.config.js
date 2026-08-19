/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        neon: {
          green: '#00FF80',
          cyan: '#00E5FF',
          dark: '#080B10',
          card: '#121822',
          border: '#1E293B'
        },
      },
    },
  },
  plugins: [],
};
