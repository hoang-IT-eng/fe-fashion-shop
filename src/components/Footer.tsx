import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck, KeyRound } from 'lucide-react'
import { NocturneMark } from './brand/NocturneMark'

export default function Footer() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-ink border-t border-bone/10 text-bone mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-bone/10">
          <div className="md:col-span-5 space-y-5">
            <NocturneMark className="w-10 h-10" showWordmark subtitle="WORN AFTER DARK" />
            <p className="font-display italic text-2xl md:text-[1.7rem] leading-snug text-bone max-w-md">
              Some things are only worn after dark.
            </p>
            <p className="text-sm text-bone-muted leading-relaxed max-w-md">
              Authenticated archival streetwear, live anti-snipe Grail Auctions, 8-step Taste Codex
              Mystery Vaults, and 1-of-1 Afterlife Atelier reconstructions. Every piece ships with an
              engraved NFC provenance dossier.
            </p>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 border border-bone/30 bg-ink-raised font-sans text-[11px] text-bone-muted">
              <KeyRound className="w-3.5 h-3.5 text-bone" />
              <span>
                NIGHT ORDER CIPHER: TYPE <strong className="text-bone">NOCTURNE</strong> OUTSIDE ANY INPUT
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-bone">
              Archive
            </h3>
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
            <h3 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-bone">
              House
            </h3>
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
            <h3 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-bone">
              Authentication Protocol
            </h3>
            <p className="text-xs text-bone-muted leading-relaxed">
              Multi-point physical inspection across stitch density, Riri/YKK metallurgy, leather
              grain, and NFC cryptographic seal before dispatch from our HCMC &amp; Tokyo vaults.
            </p>
            <div className="flex items-center gap-2 font-sans text-[11px] font-medium text-bone/80">
              <ShieldCheck className="w-4 h-4 text-bone" />
              <span>100% PROVENANCE GUARANTEE</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] tracking-[0.14em] text-bone-muted uppercase">
          <span>© 2026 NOCTURNE NIGHT ARCHIVE · ALL RIGHTS RESERVED</span>
          <span>OBSIDIAN ATELIER · SAIGON / TOKYO / ANTWERP</span>
        </div>
      </div>
    </footer>
  )
}
