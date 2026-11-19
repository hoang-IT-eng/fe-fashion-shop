import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { REBORN_JOURNAL_STORIES } from '../../../content/journal'
import { ResponsiveImage } from '../../media/ResponsiveImage'

/**
 * Chapter VI — the Afterlife journal as an editorial spread: one large
 * painted plate that changes with the story you point at, and an index of
 * dossiers beside it. Stories are editorial content shipped with the site.
 */
export function JournalChapter() {
  const [active, setActive] = useState(0)
  const lead = REBORN_JOURNAL_STORIES[active] ?? REBORN_JOURNAL_STORIES[0]
  return (
    <section aria-labelledby="journal-title" className="relative py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ember-soft">
              Chapter VI — The Afterlife journal
            </p>
            <h2 id="journal-title" className="font-display text-4xl leading-[1.02] text-bone md:text-6xl">
              Notes from the <em>atelier</em>.
            </h2>
          </div>
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone"
          >
            Read the journal <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Link
            to={`/journal?story=${lead.slug}`}
            data-reveal-img
            className="group relative block aspect-[4/3] overflow-hidden bg-ink-raised lg:col-span-7"
          >
            {REBORN_JOURNAL_STORIES.map((s, i) => (
              <div
                key={s.slug}
                aria-hidden={i !== active}
                className={`absolute inset-0 transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
              >
                <ResponsiveImage
                  src={s.imageUrl}
                  alt={i === active ? s.title : ''}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="film-grade h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-105"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-bone/80">{lead.kicker}</p>
              <p className="max-w-xl font-display text-2xl leading-snug text-bone md:text-3xl">{lead.title}</p>
            </div>
          </Link>

          <ol className="divide-y divide-bone/10 border-y border-bone/10 lg:col-span-5">
            {REBORN_JOURNAL_STORIES.map((s, i) => (
              <li key={s.slug}>
                <Link
                  to={`/journal?story=${s.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group flex gap-5 py-6"
                >
                  <span
                    aria-hidden="true"
                    data-numeral={String(i + 1).padStart(2, '0')}
                    className={`font-display text-3xl italic leading-none transition before:content-[attr(data-numeral)] ${i === active ? 'text-ember-soft' : 'text-bone/30'}`}
                  />
                  <span className="flex-1">
                    <span className="mb-1.5 block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted">
                      {s.kicker} · {s.readTime}
                    </span>
                    <span className="block font-display text-xl leading-snug text-bone group-hover:text-ember-soft">{s.title}</span>
                    <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-bone-muted">{s.excerpt}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
