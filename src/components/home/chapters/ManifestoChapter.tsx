import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ResponsiveImage } from '../../media/ResponsiveImage'
import { afterIdle, motionDisabled } from '../../../lib/motion'

/**
 * Chapter I — the house manifesto as a horizontal fresco.
 * Desktop (lg+): the chapter pins and four painted panels travel sideways
 * with vertical scroll. Mobile: the same panels become full-height stacked
 * sections that stick and snap (CSS scroll-snap on the panels only).
 * Every line states something the shop actually does.
 */
export const MANIFESTO_PANELS = [
  {
    numeral: 'I',
    kicker: 'The archive',
    line: 'Some things are only worn after dark.',
    body: 'A small, edited vault of grails, archive pieces and one-off Afterlife customs — no endless feed.',
    image: '/images/enigma/manifesto-noble.jpg',
    alt: 'Painted nobleman in a fur coat over a hoodie, holding a skeleton watch',
  },
  {
    numeral: 'II',
    kicker: 'Provenance',
    line: 'Provenance is the point.',
    body: 'Every listing carries its own authenticity code, printed on the product page and kept with your order.',
    image: '/images/enigma/manifesto-cherub.jpg',
    alt: 'Painted cherub offering an unbranded sneaker into a beam of light',
  },
  {
    numeral: 'III',
    kicker: 'Live auctions',
    line: 'A late bid buys time, not victory.',
    body: 'Bid inside the final sixty seconds and the lot clock gains two minutes. Nobody wins by sniping.',
    image: '/images/enigma/manifesto-roundel.jpg',
    alt: 'Fresco roundel with a leather bomber floating in ember light',
  },
  {
    numeral: 'IV',
    kicker: 'Concierge',
    line: 'Name your price.',
    body: 'Tell the sourcing desk the piece, the size and your target. It comes back accepted, countered or sourced.',
    image: '/images/enigma/lookbook-01.jpg',
    alt: 'Painted model in a charcoal trench and black tailoring',
  },
]

export function ManifestoChapter() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (motionDisabled()) return
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
    return afterIdle(() => {
      gsap.registerPlugin(ScrollTrigger)
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const amount = () => Math.max(0, track.scrollWidth - window.innerWidth)
        const tween = gsap.to(track, {
          x: () => -amount(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${amount()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: self => {
              if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`
            },
          },
        })
        // each painting drifts against the travel for depth
        track.querySelectorAll<HTMLElement>('[data-fresco-img]').forEach(img => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: img.closest('[data-panel]') as Element,
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            }
          )
        })
        return () => {
          tween.scrollTrigger?.kill()
          tween.kill()
        }
      })
      return () => mm.revert()
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      aria-labelledby="manifesto-title"
      className="snap-chapters relative border-b border-bone/10 bg-ink lg:h-screen lg:overflow-hidden"
    >
      <h2 id="manifesto-title" className="sr-only">
        House manifesto
      </h2>
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 hidden items-center gap-6 px-10 pt-24 lg:flex">
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-bone-muted">
          Chapter I — The house
        </span>
        <span className="relative h-px flex-1 bg-bone/15">
          <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-ember" />
        </span>
      </div>
      <div ref={trackRef} className="lg:flex lg:h-full lg:w-max">
        {MANIFESTO_PANELS.map((p, i) => (
          <article
            key={p.numeral}
            data-panel
            className="manifesto-panel sticky top-0 flex h-[100svh] snap-start flex-col justify-end overflow-hidden border-t border-bone/10 bg-ink lg:static lg:h-full lg:w-[78vw] lg:flex-row lg:items-center lg:justify-start lg:border-l lg:border-t-0 lg:first:w-[86vw] lg:first:border-l-0 xl:w-[64vw] xl:first:w-[72vw]"
            style={{ zIndex: i + 1 }}
          >
            <div className="absolute inset-0 lg:relative lg:inset-auto lg:h-[72vh] lg:w-[44%] lg:shrink-0 lg:overflow-hidden lg:ml-[6vw]">
              <ResponsiveImage
                data-fresco-img
                src={p.image}
                alt={p.alt}
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="film-grade h-full w-full scale-110 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 lg:hidden" />
            </div>
            <div className="relative z-10 px-6 pb-16 pt-24 sm:px-10 lg:max-w-xl lg:px-[4vw] lg:pb-0 lg:pt-0">
              <p className="mb-5 flex items-baseline gap-4 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ember-soft">
                <span aria-hidden="true" className="font-display text-3xl normal-case italic tracking-normal text-bone/70">
                  {p.numeral}
                </span>
                {p.kicker}
              </p>
              <p
                className="font-display leading-[1.02] text-bone"
                style={{ fontSize: 'clamp(2.4rem, 4.6vw, 4.6rem)' }}
              >
                {p.line}
              </p>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-bone/80">{p.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
