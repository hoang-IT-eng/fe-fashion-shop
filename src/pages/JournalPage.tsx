import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { REBORN_JOURNAL_STORIES } from '../api/enigmaDemoData'
import Breadcrumb from '../components/Breadcrumb'

export default function JournalPage() {
  const [searchParams] = useSearchParams()
  const initialSlug = searchParams.get('story') || REBORN_JOURNAL_STORIES[0].slug
  const [activeSlug, setActiveSlug] = useState(initialSlug)

  const activeStory =
    REBORN_JOURNAL_STORIES.find(s => s.slug === activeSlug) || REBORN_JOURNAL_STORIES[0]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f9f9f9] py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[{ label: 'Archive', path: '/' }, { label: 'Reborn Editorial Journal' }]}
        />

        <div className="pb-10 border-b border-[#f9f9f9]/10 mb-12">
          <p className="font-mono text-xs tracking-[0.32em] uppercase text-[#f9f9f9] mb-2">
            REBORN ATELIER · ARCHIVAL ESSAYS &amp; METALLURGY
          </p>
          <h1 className="font-display text-4xl md:text-6xl text-[#f9f9f9]">
            The Reborn Chronicles
          </h1>
        </div>

        {/* Featured Reader Dossier */}
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16 border-b border-[#f9f9f9]/10 mb-14">
          <div className="lg:col-span-6">
            <img
              src={activeStory.imageUrl}
              alt={activeStory.title}
              className="film-grade w-full aspect-[4/3] object-cover border border-[#f9f9f9]/12"
            />
          </div>
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs text-[#f9f9f9] uppercase tracking-widest">
                <span>{activeStory.kicker}</span>
                <span>{activeStory.readTime}</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-[#f9f9f9] leading-tight">
                {activeStory.title}
              </h2>
              <p className="font-mono text-xs text-[#a3a3a3] uppercase tracking-wider">
                By {activeStory.author} · {activeStory.publishedAt}
              </p>
              <div className="space-y-4 pt-2 text-sm md:text-base text-[#f9f9f9]/85 leading-relaxed">
                {activeStory.body.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#f9f9f9]/10">
              <Link
                to="/products?releaseType=reborn"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#d9d9d9] transition"
              >
                Acquire Reborn Archive Pieces <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </article>

        {/* All Journal Dossiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REBORN_JOURNAL_STORIES.map(story => (
            <button
              key={story.slug}
              type="button"
              onClick={() => setActiveSlug(story.slug)}
              className={`text-left p-5 bg-[#111111] border transition space-y-3 ${
                story.slug === activeStory.slug
                  ? 'border-[#f9f9f9]'
                  : 'border-[#f9f9f9]/10 hover:border-[#f9f9f9]/35'
              }`}
            >
              <span className="block font-mono text-[10px] tracking-[0.22em] uppercase text-[#f9f9f9]">
                {story.kicker}
              </span>
              <h3 className="font-display text-xl text-[#f9f9f9]">{story.title}</h3>
              <p className="text-xs text-[#a3a3a3] line-clamp-2">{story.excerpt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
