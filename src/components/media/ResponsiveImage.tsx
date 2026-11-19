import React from 'react'
import manifest from '../../lib/imageManifest.json'

type Entry = { base: string; widths: number[]; width: number; height: number; lqip: string }
const MANIFEST = manifest as Record<string, Entry>

/** Look up a pipeline entry by any path or bare name, e.g. "/images/enigma/mystery-chest.jpg". */
export function imageEntry(src: string | undefined | null): Entry | null {
  if (!src) return null
  const name = src.split('?')[0].split('/').pop()?.replace(/\.(jpe?g|png|webp|avif)$/i, '')
  return (name && MANIFEST[name]) || null
}

export interface ResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string | undefined
  alt: string
  /** CSS `sizes`, e.g. "(min-width: 1024px) 33vw, 100vw". */
  sizes?: string
  /** Above-the-fold / LCP image: eager + high fetch priority. */
  priority?: boolean
  /** Show the blurred LQIP behind the image while it loads. */
  placeholder?: boolean
}

/**
 * AVIF -> WebP -> JPEG <picture> for images produced by scripts/build-images.mjs.
 * Unknown sources (e.g. Cloudinary uploads from the live API) fall back to a plain lazy <img>.
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  priority = false,
  placeholder = true,
  className,
  style,
  ...rest
}: ResponsiveImageProps) {
  const entry = imageEntry(src)
  const loading = priority ? 'eager' : 'lazy'
  const fetchPriority = priority ? 'high' : 'auto'

  if (!entry) {
    return <img src={src || undefined} alt={alt} loading={loading} decoding="async" className={className} style={style} {...rest} />
  }

  const set = (ext: string) => entry.widths.map(w => `${entry.base}-${w}.${ext} ${w}w`).join(', ')
  const fallback = `${entry.base}-${entry.widths[entry.widths.length - 1]}.webp`
  const bg: React.CSSProperties = placeholder
    ? { backgroundImage: `url("${entry.lqip}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        width={entry.width}
        height={entry.height}
        loading={loading}
        decoding={priority ? 'sync' : 'async'}
        // React 19 supports the lowercase attribute name.
        fetchPriority={fetchPriority}
        className={className}
        style={{ ...bg, ...style }}
        {...rest}
      />
    </picture>
  )
}

/**
 * Art-directed full-bleed hero still: portrait crop on narrow screens, wide
 * crop elsewhere. Always rendered as the LCP element; WebGL fades in above it.
 */
export function HeroPoster({ className = '', alt = '' }: { className?: string; alt?: string }) {
  const d = MANIFEST['hero-sky-desktop']
  const m = MANIFEST['hero-sky-mobile']
  const set = (e: Entry, ext: string) => e.widths.map(w => `${e.base}-${w}.${ext} ${w}w`).join(', ')
  return (
    <picture>
      <source media="(max-aspect-ratio: 4/5)" type="image/avif" srcSet={set(m, 'avif')} sizes="100vw" />
      <source media="(max-aspect-ratio: 4/5)" type="image/webp" srcSet={set(m, 'webp')} sizes="100vw" />
      <source type="image/avif" srcSet={set(d, 'avif')} sizes="100vw" />
      <source type="image/webp" srcSet={set(d, 'webp')} sizes="100vw" />
      <img
        src={`${d.base}-1440.webp`}
        alt={alt}
        width={d.width}
        height={d.height}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        className={className}
        style={{ backgroundImage: `url("${d.lqip}")`, backgroundSize: 'cover' }}
      />
    </picture>
  )
}
