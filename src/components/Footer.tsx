import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUp, ShieldCheck, KeyRound } from 'lucide-react'
import { NocturneMark, NocturneWordmark } from './brand/NocturneMark'
import { ResponsiveImage } from './media/ResponsiveImage'
import { CloudHost, useCloudLive } from './experience/cloud/CloudHost'
import { cloud, cloudsSupported } from './experience/cloud/cloudState'
import { afterIdle, getLenis, motionDisabled } from '../lib/motion'

/** The footer coda: the camera looks back up into the clouds — an ascent that closes the reel. */
function FooterCoda() {
  const ref = useRef<HTMLElement | null>(null)
  const live = useCloudLive('footer')
  useEffect(() => {
    const el = ref.current
    if (!el || !cloudsSupported()) return
    return afterIdle(() => {
      gsap.registerPlugin(ScrollTrigger)
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom bottom',
        onUpdate: self => {
          cloud.footer = self.progress
        },
      })
      return () => st.kill()
    }, 1500)
  }, [])
  const ascend = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 2.6 })
    else window.scrollTo({ top: 0, behavior: motionDisabled() ? 'auto' : 'smooth' })
  }
  return (
    <section
      ref={ref}
      aria-label="End of the reel"
      className="relative h-[72vh] min-h-[420px] max-h-[760px] overflow-hidden border-t border-bone/10"
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-1000 ${live ? 'opacity-0' : 'opacity-100'}`}
      >
        <ResponsiveImage
          src="/images/enigma/hero-sky-desktop.jpg"
          alt=""
          sizes="100vw"
          className="h-full w-full -scale-y-100 object-cover opacity-80"
        />
      </div>
      <CloudHost mode="footer" className="absolute inset-0" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-ink to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_55%,rgba(11,9,8,0.55),rgba(11,9,8,0)_75%)]" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-ember-soft">End of reel N°01</p>
        <NocturneWordmark className="h-8 w-auto text-bone md:h-14" />
        <p className="max-w-md font-display text-xl italic leading-snug text-bone/85 md:text-2xl">
          Back to the surface — the vault stays open after dark.
        </p>
        <button
          type="button"
          onClick={ascend}
          data-cursor="Ascend"
          className="mt-2 inline-flex items-center gap-2 border border-bone/40 bg-ink/30 px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-bone backdrop-blur-sm transition hover:border-bone"
        >
          Ascend <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}

export default function Footer() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-ink text-bone mt-24">
      <FooterCoda />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-bone/10">
          <div className="md:col-span-5 space-y-5">
            <NocturneMark className="w-10 h-10" showWordmark subtitle="WORN AFTER DARK" />
            <p className="font-display italic text-2xl md:text-[1.7rem] leading-snug text-bone max-w-md">
              Some things are only worn after dark.
            </p>
            <p className="text-sm text-bone-muted leading-relaxed max-w-md">
              Authenticated archival streetwear, live anti-snipe Grail Auctions, 8-step Taste Codex
              Mystery Vaults, and 1-of-1 Afterlife Atelier reconstructions. Every listing carries its
              own authenticity code.
            </p>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 border border-bone/30 bg-ink-raised font-sans text-[11px] text-bone-muted">
              <KeyRound className="w-3.5 h-3.5 text-bone" />
              <span>
                NIGHT ORDER CIPHER: TYPE <strong className="text-bone">NOCTURNE</strong> OUTSIDE ANY INPUT
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h2 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-bone">
              Archive
            </h2>
            <ul className="space-y-2.5 text-sm text-bone-muted">
              <li>
                <Link to="/products" className="hover:text-bone transition">
                  Curated Drops
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="hover:text-bone transition">
                  Live Grail Auctions
                </Link>
              </li>
              <li>
                <Link to="/mystery-boxes" className="hover:text-bone transition">
                  Mystery Vault &amp; Quiz
                </Link>
              </li>
              <li>
                <Link to="/concierge" className="hover:text-bone transition">
                  Name Your Price
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h2 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-bone">
              House
            </h2>
            <ul className="space-y-2.5 text-sm text-bone-muted">
              <li>
                <Link to="/journal" className="hover:text-bone transition">
                  Afterlife Atelier Dossiers
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-bone transition">
                  Collector Wishlist
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-bone transition">
                  Order Provenance
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-bone transition">
                  Collector Access
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h2 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-bone">
              Authentication Protocol
            </h2>
            <p className="text-xs text-bone-muted leading-relaxed">
              Every listing carries its own authenticity code. Pieces are checked for stitch density,
              hardware and leather grain before dispatch.
            </p>
            <div className="flex items-center gap-2 font-sans text-[11px] font-medium text-bone/80">
              <ShieldCheck className="w-4 h-4 text-bone" />
              <span>100% PROVENANCE GUARANTEE</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] tracking-[0.14em] text-bone-muted uppercase">
          <span>© 2026 NOCTURNE NIGHT ARCHIVE · ALL RIGHTS RESERVED</span>
          <span className="normal-case tracking-[0.04em]">Designed and built by Trần Huy Hoàng, 2026.</span>
          <span>OBSIDIAN ATELIER · SAIGON / TOKYO / ANTWERP</span>
        </div>
      </div>
    </footer>
  )
}
