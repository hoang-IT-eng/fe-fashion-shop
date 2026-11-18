/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0a0a0a',
        charcoal: '#111111',
        slate: '#232323',
        bone: '#f9f9f9',
        pewter: '#a3a3a3',
        // Monochrome restyle: the former gold accent is retired. The token is
        // repurposed to the neutral off-white so legacy `gold` call sites
        // render monochrome instead of breaking.
        gold: '#f9f9f9',
        'gold-dim': '#d9d9d9',
        crimson: '#b54444',
        sage: '#5e8c6a',
        // Legacy aliases mapped cleanly to Enigma tokens
        ink: '#f9f9f9',
        paper: '#0a0a0a',
        sand: '#111111',
        line: '#232323',
        muted: '#a3a3a3',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        ritual: ['"Playfair Display"', 'Georgia', 'serif'],
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
