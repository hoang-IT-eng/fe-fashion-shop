import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { afterIdle, motionDisabled } from '../../lib/motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '../../types/product'
import ProductCard from '../ProductCard'
import { QuickViewModal } from '../QuickViewModal'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { useRevealScope } from '../experience/useReveal'
import { ManifestoChapter } from './chapters/ManifestoChapter'
import { AuctionsChapter } from './chapters/AuctionsChapter'
import { UnboxingChapter } from './chapters/UnboxingChapter'
import { NameYourPriceChapter } from './chapters/NameYourPriceChapter'
import { JournalChapter } from './chapters/JournalChapter'

/**
 * Everything below the descent, in chapters. This module is code-split and
 * only mounted when the visitor approaches it (see LazyChapters), so none of
 * it is on the first-paint path.
 */
export default function HomeChapters({ products }: { products: Product[] }) {
  const [quick, setQuick] = useState<Product | null>(null)
  const ref = useRevealScope<HTMLDivElement>(products.length)

  // the chapters replace a fixed-height placeholder: re-measure triggers below (footer coda)
  useEffect(() => {
    if (motionDisabled()) return
    return afterIdle(() => {
      const id = window.setTimeout(() => ScrollTrigger.refresh(), 400)
      return () => window.clearTimeout(id)
    }, 1500)
  }, [])

  return (
    <div ref={ref}>
      <ManifestoChapter />

      <section aria-labelledby="drops-title" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div data-reveal>
            <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ember-soft">
              Chapter II — The vault
            </p>
            <h2 id="drops-title" className="font-display text-4xl leading-[1.02] text-bone md:text-6xl">
              Curated Grail Drops
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone"
          >
            Inspect the full archive <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <div data-reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map(p => (
            <ProductCard key={p.id} product={p} onQuickView={setQuick} />
          ))}
        </div>
      </section>

      <section aria-label="The Afterlife atelier" className="relative border-y border-bone/10">
        <div className="relative h-[54vh] overflow-hidden md:h-[66vh]" data-parallax="12">
          <ResponsiveImage
            sizes="100vw"
            src="/images/enigma/reborn-atelier.jpg"
            alt="A craftsman re-stitching a leather upper by candlelight"
            className="film-grade absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/50" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <p data-reveal className="mb-5 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-bone/80">
              The Afterlife atelier
            </p>
            <p
              data-reveal
              className="max-w-3xl font-display leading-[1.1] text-bone"
              style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3.6rem)' }}
            >
              Worn pieces come back as <em>one-offs</em>.
            </p>
          </div>
        </div>
      </section>

      <AuctionsChapter />
      <UnboxingChapter />
      <NameYourPriceChapter />
      <JournalChapter />

      <QuickViewModal product={quick} onClose={() => setQuick(null)} />
    </div>
  )
}
