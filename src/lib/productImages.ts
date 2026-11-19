/**
 * Frontend art-direction map for catalog rows whose stored image does not
 * show the product (the live DB reuses a few placeholder shots — e.g. the
 * sterling chain row points at the chronograph photo). Keyed by product name
 * pattern so it works for the live API, the demo vault, cart lines, order
 * items and auction lots alike, without a DB migration.
 */
const BY_NAME: Array<[RegExp, string]> = [
  [/sanctum chain|sterling .*chain|curb .*chain/i, '/images/enigma/grail-chain-sanctum.jpg'],
  [/selvedge .*denim|kuroki mill/i, '/images/enigma/grail-denim-kuroki.jpg'],
  [/boxy tee|heavyweight .*tee\b/i, '/images/enigma/grail-tee-chiaroscuro.jpg'],
]

/** Placeholder shots the live rows reuse; only these are ever overridden. */
const REUSED = /grail-(chronograph-relic|cargo-vanguard|hoodie-shadow)\.jpg$/

export function correctImageFor(name: string | null | undefined, current: string | null | undefined): string | null | undefined {
  // never touch admin-uploaded / CDN images, only the reused placeholders
  if (!name || (current && !REUSED.test(current))) return current
  for (const [re, src] of BY_NAME) if (re.test(name)) return src
  return current
}

const NAME_KEYS = ['name', 'productName', 'title'] as const

/** Deep-walk an API payload and fix `imageUrl` on any object whose name maps to a better image. */
export function correctProductImages<T>(value: T): T {
  if (Array.isArray(value)) return value.map(correctProductImages) as T
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    let changed: Record<string, unknown> | null = null
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object') {
        const next = correctProductImages(v)
        if (next !== v) (changed ??= { ...obj })[k] = next
      }
    }
    if (typeof obj.imageUrl === 'string') {
      const name = NAME_KEYS.map(k => obj[k]).find(v => typeof v === 'string') as string | undefined
      const fixed = correctImageFor(name, obj.imageUrl)
      if (fixed !== obj.imageUrl) (changed ??= { ...obj }).imageUrl = fixed
    }
    return (changed ?? obj) as T
  }
  return value
}
