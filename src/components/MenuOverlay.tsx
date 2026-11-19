import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, X } from 'lucide-react'
import { NocturneWordmark } from './brand/NocturneMark'
import { HeroPoster } from './media/ResponsiveImage'
import { getLenis } from '../lib/motion'
import { cloudsSupported, getCloudWorld, loadCloudWorld, veilIn, veilOut } from './experience/cloud/cloudState'

export interface MenuItem {
  label: string
  path: string
  note: string
}

interface MenuOverlayProps {
  open: boolean
  onClose: () => void
  items: MenuItem[]
  isAuthenticated: boolean
  isAdmin: boolean
  returnFocusTo?: React.RefObject<HTMLElement | null>
}

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI']

/**
 * Full-screen menu that opens inside the clouds: the shared cloud veil rolls
 * in behind it and parts again on close. Without the live world it uses the
 * static painting under a deep ink wash. Modal: focus is trapped, Esc closes,
 * focus returns to the toggle.
 */
export function MenuOverlay({ open, onClose, items, isAuthenticated, isAdmin, returnFocusTo }: MenuOverlayProps) {
  const location = useLocation()
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const [live, setLive] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open) {
      wasOpen.current = true
      setMounted(true)
      const world = getCloudWorld()
      setLive(Boolean(world))
      if (world) veilIn(2.8)
      else if (cloudsSupported()) void loadCloudWorld()
      getLenis()?.stop()
      document.documentElement.style.overflow = 'hidden'
      const raf = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(raf)
    }
    if (!wasOpen.current) return
    wasOpen.current = false
    setShown(false)
    if (getCloudWorld()) veilOut(2.2)
    getLenis()?.start()
    document.documentElement.style.overflow = ''
    const t = window.setTimeout(() => setMounted(false), 520)
    return () => window.clearTimeout(t)
  }, [open])

  // Close on navigation
  useEffect(() => {
    if (open) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Focus management
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (shown) panel?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, shown, onClose])

  useEffect(() => {
    if (!open && mounted) returnFocusTo?.current?.focus?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      id="site-menu"
      className="fixed inset-0 z-[115] text-bone"
    >
      {!live && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-500 ${shown ? 'opacity-100' : 'opacity-0'}`}
        >
          <HeroPoster className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-ink/85" />
        </div>
      )}
      {live && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(11,9,8,0.55),rgba(11,9,8,0.1)_70%)] transition-opacity duration-500 ${shown ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      <div className="relative mx-auto flex h-full max-w-7xl flex-col px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link to="/" aria-label="NOCTURNE home" className="text-bone">
            <NocturneWordmark className="h-4 w-auto md:h-5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 border border-bone/30 bg-ink/30 px-3 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-bone backdrop-blur-sm transition hover:border-bone"
          >
            Close <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 content-center gap-10 pb-10 md:grid-cols-12">
          <nav aria-label="Primary" className="md:col-span-8">
            <ul className="space-y-1 md:space-y-2">
              {items.map((item, i) => {
                const active = location.pathname.startsWith(item.path)
                return (
                  <li
                    key={item.path}
                    className="transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                    style={{
                      transitionDelay: shown ? `${160 + i * 60}ms` : '0ms',
                      opacity: shown ? 1 : 0,
                      transform: shown ? 'none' : 'translateY(28px)',
                    }}
                  >
                    <Link
                      to={item.path}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className="group flex items-baseline gap-4 py-1 md:gap-6"
                    >
                      <span className="w-8 font-mono text-[11px] tracking-[0.2em] text-ember-soft md:w-10">
                        {NUMERALS[i]}
                      </span>
                      <span
                        className={`font-display leading-[1.02] transition-colors duration-300 group-hover:text-ember-soft group-focus-visible:text-ember-soft ${
                          active ? 'italic text-bone' : 'text-bone/90'
                        }`}
                        style={{ fontSize: 'clamp(2.3rem, 6.2vw, 5.2rem)' }}
                      >
                        {item.label}
                      </span>
                      <span className="hidden font-sans text-xs text-bone-muted lg:inline">{item.note}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div
            className="space-y-6 self-end transition-opacity duration-700 md:col-span-4"
            style={{ transitionDelay: shown ? '520ms' : '0ms', opacity: shown ? 1 : 0 }}
          >
            <p className="max-w-xs font-display text-2xl italic leading-snug text-bone/85">
              Some things are only worn after dark.
            </p>
            <div className="flex flex-col gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em]">
              {isAuthenticated ? (
                <>
                  <Link to="/orders" onClick={onClose} className="inline-flex items-center gap-2 text-bone hover:text-ember-soft">
                    Orders &amp; provenance <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/profile" onClick={onClose} className="inline-flex items-center gap-2 text-bone hover:text-ember-soft">
                    Collector dossier <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={onClose} className="inline-flex items-center gap-2 text-bone hover:text-ember-soft">
                      Admin desk <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </>
              ) : (
                <Link to="/auth" onClick={onClose} className="inline-flex items-center gap-2 text-bone hover:text-ember-soft">
                  Sign in / Initiate <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <Link to="/wishlist" onClick={onClose} className="inline-flex items-center gap-2 text-bone-muted hover:text-bone">
                Saved grails <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50">Saigon · Antwerp · Osaka</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
