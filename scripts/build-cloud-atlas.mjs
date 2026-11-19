#!/usr/bin/env node
/**
 * Packs the four painted cloud sprites (design/source-images/cloud-sprite-{a..d}.jpg,
 * painted on near-black) into one 2x2 RGBA atlas for the WebGL cloud world.
 * Alpha is derived from luminance above the canvas black, with a soft
 * elliptical falloff so a billboard's edges can never show.
 * Output: public/images/nocturne/cloud-atlas.webp + src/components/experience/cloud/atlas.json
 * Run: npm run images:clouds
 */
import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'

const CELL = 384
const NAMES = ['a', 'b', 'c', 'd']
const atlas = Buffer.alloc(CELL * 2 * CELL * 2 * 4)
const cells = []

for (const [i, n] of NAMES.entries()) {
  const src = `design/source-images/cloud-sprite-${n}.jpg`
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  // bounding box of painted content
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const o = (y * info.width + x) * 3
    const l = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]
    if (l > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  }
  const pad = 0.06
  const bw = x1 - x0, bh = y1 - y0
  const left = Math.max(0, Math.round(x0 - bw * pad)), top = Math.max(0, Math.round(y0 - bh * pad))
  const width = Math.min(info.width - left, Math.round(bw * (1 + 2 * pad)))
  const height = Math.min(info.height - top, Math.round(bh * (1 + 2 * pad)))
  const aspect = width / height
  // fit into the cell, stretched to fill (aspect restored on the billboard)
  const { data: px } = await sharp(src).extract({ left, top, width, height })
    .resize(CELL, CELL, { fit: 'fill', kernel: 'lanczos3' }).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true })
  const cx = (i % 2) * CELL, cy = Math.floor(i / 2) * CELL
  for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) {
    const o = (y * CELL + x) * 3
    const r = px[o], g = px[o + 1], b = px[o + 2]
    const l = 0.299 * r + 0.587 * g + 0.114 * b
    let a = Math.min(1, Math.max(0, (l - 9) / 70)) ** 0.8
    const ex = (x / CELL - 0.5) * 2, ey = (y / CELL - 0.5) * 2
    const e = Math.sqrt(ex * ex + ey * ey)
    a *= Math.min(1, Math.max(0, (1.0 - e) / 0.22))
    // un-darken the colour where alpha is partial so edges don't halo black
    const k = a > 0.02 ? Math.min(2.2, 1 / Math.max(0.45, a ** 0.5)) : 1
    const t = ((cy + y) * CELL * 2 + cx + x) * 4
    atlas[t] = Math.min(255, r * k); atlas[t + 1] = Math.min(255, g * k); atlas[t + 2] = Math.min(255, b * k)
    atlas[t + 3] = Math.round(a * 255)
  }
  cells.push({ name: n, u: (i % 2) * 0.5, v: Math.floor(i / 2) * 0.5, aspect: +aspect.toFixed(3) })
}

const out = await sharp(atlas, { raw: { width: CELL * 2, height: CELL * 2, channels: 4 } })
  .webp({ quality: 72, alphaQuality: 70, effort: 6 }).toBuffer()
await writeFile('public/images/nocturne/cloud-atlas.webp', out)
await writeFile('src/components/experience/cloud/atlas.json', JSON.stringify({ src: '/images/nocturne/cloud-atlas.webp', cells }, null, 2) + '\n')
console.log('cloud atlas', (out.length / 1024).toFixed(1), 'kB', cells)
