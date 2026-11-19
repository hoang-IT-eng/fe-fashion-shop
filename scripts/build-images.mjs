#!/usr/bin/env node
/**
 * NOCTURNE image pipeline.
 * design/source-images/*.jpg  ->  public/images/nocturne/<name>-<w>.{avif,webp}
 *                              +  public/images/enigma/<name>.jpg (legacy path, 960w, kept because
 *                                 live API rows still point at /images/enigma/*.jpg)
 *                              +  src/lib/imageManifest.json (widths, intrinsic size, LQIP)
 * Run: npm run images
 */
import sharp from 'sharp'
import { readdir, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'design/source-images'
const OUT = 'public/images/nocturne'
const LEGACY = 'public/images/enigma'
const MANIFEST = 'src/lib/imageManifest.json'

// Per-image target widths. Painted sources are upscaled at most 1.5x (lanczos3),
// which holds up on canvas-textured artwork.
const PRESETS = {
  'hero-sky-desktop': [960, 1440, 1920],
  'hero-sky-mobile': [540, 810, 1080],
  default: [480, 864],
  wide: [640, 1152],
}
const WIDE = new Set(['mystery-chest', 'reborn-atelier'])
const LEGACY_ALIASES = { 'hero-sky-desktop': ['chiaroscuro-sky'] }

await mkdir(OUT, { recursive: true })
await mkdir(LEGACY, { recursive: true })
const manifest = {}
let total = 0

for (const file of (await readdir(SRC)).filter(f => /\.(jpe?g|png)$/i.test(f)).sort()) {
  const name = file.replace(/\.[^.]+$/, '')
  const input = sharp(path.join(SRC, file))
  const meta = await input.metadata()
  const widths = PRESETS[name] || (WIDE.has(name) ? PRESETS.wide : PRESETS.default)
  const ratio = meta.height / meta.width
  for (const w of widths) {
    const resized = sharp(path.join(SRC, file)).resize({ width: w, kernel: 'lanczos3' })
    const avif = await resized.clone().avif({ quality: 52, effort: 6 }).toBuffer()
    const webp = await resized.clone().webp({ quality: 74 }).toBuffer()
    await writeFile(path.join(OUT, `${name}-${w}.avif`), avif)
    await writeFile(path.join(OUT, `${name}-${w}.webp`), webp)
    total += avif.length + webp.length
  }
  const fallbackW = Math.min(960, widths[widths.length - 1])
  const jpg = await sharp(path.join(SRC, file)).resize({ width: fallbackW }).jpeg({ quality: 78, mozjpeg: true }).toBuffer()
  for (const legacyName of [name, ...(LEGACY_ALIASES[name] || [])]) {
    await writeFile(path.join(LEGACY, `${legacyName}.jpg`), jpg)
  }
  const lqip = await sharp(path.join(SRC, file)).resize({ width: 16 }).blur(1).webp({ quality: 40 }).toBuffer()
  const entry = {
    base: `/images/nocturne/${name}`,
    widths,
    width: widths[widths.length - 1],
    height: Math.round(widths[widths.length - 1] * ratio),
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  }
  for (const key of [name, ...(LEGACY_ALIASES[name] || [])]) manifest[key] = entry
  console.log(`${name}: ${widths.join('/')}w`)
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`wrote ${Object.keys(manifest).length} manifest entries, ${(total / 1024).toFixed(0)} KB of AVIF+WebP`)
