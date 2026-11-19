/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NOCTURNE art tokens ("Nocturne Fresco"): warm ink, bone, umber, one ember accent.
        ink: { DEFAULT: '#0b0908', raised: '#15110e', deep: '#070605' },
        bone: { DEFAULT: '#efe9df', dim: '#d8cfc1', muted: '#a69c8e' },
        umber: { DEFAULT: '#3a2216', line: '#2a211b', glow: '#5a3320' },
        ember: { DEFAULT: '#c8864a', soft: '#e0a874', deep: '#a86c38' },
        verdigris: '#4f5b45',
        // Legacy names kept so older call sites resolve to the new palette.
        obsidian: '#0b0908',
        charcoal: '#15110e',
        slate: '#2a211b',
        pewter: '#a69c8e',
        gold: '#c8864a',
        'gold-dim': '#a86c38',
        crimson: '#b54444',
        sage: '#5e8c6a',
      },
      fontFamily: {
        sans: ['"Manrope Variable"', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond Variable"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        ritual: ['"Cormorant Garamond Variable"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        brand: '0.34em',
        ritual: '0.24em',
      },
    },
  },
  plugins: [],
}
