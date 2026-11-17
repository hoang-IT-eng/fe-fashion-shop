/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#070709',
        charcoal: '#111115',
        slate: '#1c1d24',
        bone: '#ece5d8',
        pewter: '#9a948a',
        gold: '#cfa156',
        'gold-dim': '#9e7839',
        crimson: '#b54444',
        sage: '#5e8c6a',
        // Legacy aliases mapped cleanly to Enigma tokens
        ink: '#ece5d8',
        paper: '#070709',
        sand: '#111115',
        line: '#1c1d24',
        muted: '#9a948a',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Cinzel', 'Georgia', 'serif'],
        ritual: ['Cinzel', '"Cormorant Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        brand: '0.34em',
        ritual: '0.24em',
      },
    },
  },
  plugins: [],
}
