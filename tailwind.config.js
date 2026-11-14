/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0c0c0c',
        paper: '#f7f6f4',
        sand: '#ebe7e1',
        line: '#e8e6e3',
        muted: '#6b6b6b',
      },
      fontFamily: {
        sans: ['Outfit', 'Helvetica Neue', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      letterSpacing: {
        brand: '0.35em',
      },
    },
  },
  plugins: [],
}
