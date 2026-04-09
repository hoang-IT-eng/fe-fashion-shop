/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uniqlo: {
          red: '#FF0000',
          gray: '#F4F4F4',
        }
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}