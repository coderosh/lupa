/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}', './static/*.html'],
  theme: {
    extend: {
      colors: {
        base: 'var(--base-color)',
        card: 'var(--card-color)',
        text: 'var(--text-color)',
        border: 'var(--border-color)',
      },
    },
  },
  plugins: [],
};
