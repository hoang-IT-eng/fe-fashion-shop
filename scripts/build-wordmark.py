#!/usr/bin/env python3
"""Regenerate the NOCTURNE wordmark outlines (src/components/brand/wordmarkPath.ts,
public/nocturne-wordmark.svg, public/nocturne-mark.svg).
Letters: Cormorant Garamond (SIL OFL 1.1) at wght 500, tracked +300/1000 em.
The "O" is replaced by the eclipse glyph (bone ring + ember crescent).
Requires: pip install fonttools brotli
"""
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT = 'node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2'
f = instancer.instantiateVariableFont(TTFont(FONT), {'wght': 500})
gs, cmap = f.getGlyphSet(), f.getBestCmap()
cap = getattr(f['OS/2'], 'sCapHeight', 0) or 650
track, x, paths, ecl = 300, 0, [], None
for ch in 'NOCTURNE':
    if ch == 'O':
        w = cap * 1.02
        ecl = (x + w / 2, cap / 2, cap / 2)
        x += w + track
        continue
    g = gs[cmap[ord(ch)]]
    pen = SVGPathPen(gs)
    g.draw(TransformPen(pen, (1, 0, 0, -1, x, cap)))
    paths.append(pen.getCommands())
    x += g.width + track
W = x - track
cx, cy, r = ecl[0], cap - ecl[1], ecl[2]
d = ' '.join(paths)
vb = f'0 -60 {W:.0f} {cap + 120:.0f}'
open('src/components/brand/wordmarkPath.ts', 'w').write(
    '// Generated from Cormorant Garamond (SIL OFL 1.1) outlines at wght 500, tracked +300,\n'
    '// with the "O" replaced by the NOCTURNE eclipse glyph. Regenerate with scripts/build-wordmark.py.\n'
    f"export const WORDMARK_VIEWBOX = '{vb}'\nexport const WORDMARK_LETTERS = '{d}'\n"
    f'export const ECLIPSE = {{ cx: {cx:.0f}, cy: {cy:.0f}, r: {r:.0f} }}\n')
def eclipse(cx, cy, r, ring, mid, stroke):
    return (f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r - ring / 2:.1f}" fill="none" stroke="{stroke}" stroke-width="{ring}"/>'
            f'<mask id="{mid}"><rect x="{cx - r:.1f}" y="{cy - r:.1f}" width="{2 * r:.1f}" height="{2 * r:.1f}" fill="#fff"/>'
            f'<circle cx="{cx + r * .26:.1f}" cy="{cy - r * .16:.1f}" r="{r * .56:.1f}" fill="#000"/></mask>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r * .62:.1f}" fill="#c8864a" mask="url(#{mid})"/>')
open('public/nocturne-wordmark.svg', 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="NOCTURNE">'
    f'<path fill="#efe9df" d="{d}"/>{eclipse(cx, cy, r, 20, "c", "#efe9df")}</svg>\n')
open('public/nocturne-mark.svg', 'w').write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0b0908"/>'
    f'{eclipse(32, 32, 28, 2.5, "m", "#efe9df")}</svg>\n')
print('wordmark regenerated', W)
