import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck, KeyRound } from 'lucide-react'
import { EnigmaCrest } from './EnigmaCrest'

export default function Footer() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#f9f9f9]/10 text-[#f9f9f9] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#f9f9f9]/10">
          <div className="md:col-span-5 space-y-5">
            <EnigmaCrest className="w-10 h-10" showWordmark subtitle="RARITY IS PHILOSOPHY" />
            <p className="font-display italic text-2xl md:text-[1.7rem] leading-snug text-[#f9f9f9] max-w-md">
              This isn’t fashion — it’s initiation.
            </p>
            <p className="text-sm text-[#a3a3a3] leading-relaxed max-w-md">
              Authenticated archival streetwear, live anti-snipe Grail Auctions, 8-step Taste Codex
              Mystery Vaults, and 1-of-1 Reborn Atelier reconstructions. Every piece ships with an
              engraved NFC provenance dossier.
            </p>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 border border-[#f9f9f9]/30 bg-[#111111] font-sans text-[11px] text-[#a3a3a3]">
              <KeyRound className="w-3.5 h-3.5 text-[#f9f9f9]" />
              <span>
                INNER CIRCLE CIPHER: TYPE <strong className="text-[#f9f9f9]">ENIGMA</strong> OUTSIDE ANY INPUT
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-[#f9f9f9]">
              Archive
            </h3>
            <ul className="space-y-2.5 text-sm text-[#a3a3a3]">
              <li>
                <Link to="/products" className="hover:text-[#f9f9f9] transition">
                  Curated Drops
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="hover:text-[#f9f9f9] transition">
                  Live Grail Auctions
                </Link>
              </li>
              <li>
                <Link to="/mystery-boxes" className="hover:text-[#f9f9f9] transition">
                  Mystery Vault &amp; Quiz
                </Link>
              </li>
              <li>
                <Link to="/concierge" className="hover:text-[#f9f9f9] transition">
                  Find It At My Price
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-[#f9f9f9]">
              House
            </h3>
            <ul className="space-y-2.5 text-sm text-[#a3a3a3]">
              <li>
                <Link to="/journal" className="hover:text-[#f9f9f9] transition">
                  Reborn Atelier Dossiers
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#f9f9f9] transition">
                  Collector Wishlist
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#f9f9f9] transition">
                  Order Provenance
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[#f9f9f9] transition">
                  Collector Access
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h3 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-[#f9f9f9]">
              Authentication Protocol
            </h3>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Multi-point physical inspection across stitch density, Riri/YKK metallurgy, leather
              grain, and NFC cryptographic seal before dispatch from our HCMC &amp; Tokyo vaults.
            </p>
            <div className="flex items-center gap-2 font-sans text-[11px] font-medium text-[#f9f9f9]/80">
              <ShieldCheck className="w-4 h-4 text-[#f9f9f9]" />
              <span>100% PROVENANCE GUARANTEE</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] tracking-[0.14em] text-[#a3a3a3] uppercase">
          <span>© 2026 ENIGMA CULT ARCHIVE · ALL RIGHTS RESERVED</span>
          <span>OBSIDIAN ATELIER · SAIGON / TOKYO / ANTWERP</span>
        </div>
      </div>
    </footer>
  )
}
