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
    <footer className="bg-[#070709] border-t border-[#ece5d8]/10 text-[#ece5d8] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#ece5d8]/10">
          <div className="md:col-span-5 space-y-5">
            <EnigmaCrest className="w-10 h-10" showWordmark subtitle="RARITY IS PHILOSOPHY" />
            <p className="text-sm text-[#9a948a] leading-relaxed max-w-md">
              Authenticated archival streetwear, live anti-snipe Grail Auctions, 8-step Taste Codex
              Mystery Vaults, and 1-of-1 Reborn Atelier reconstructions. Every piece ships with an
              engraved NFC provenance dossier.
            </p>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 border border-[#cfa156]/30 bg-[#111115] font-mono text-[11px] text-[#9a948a]">
              <KeyRound className="w-3.5 h-3.5 text-[#cfa156]" />
              <span>
                INNER CIRCLE CIPHER: TYPE <strong className="text-[#ece5d8]">ENIGMA</strong> OUTSIDE ANY INPUT
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-mono text-[11px] tracking-[0.26em] uppercase text-[#cfa156]">
              Archive
            </h3>
            <ul className="space-y-2.5 text-sm text-[#9a948a]">
              <li>
                <Link to="/products" className="hover:text-[#ece5d8] transition">
                  Curated Drops
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="hover:text-[#ece5d8] transition">
                  Live Grail Auctions
                </Link>
              </li>
              <li>
                <Link to="/mystery-boxes" className="hover:text-[#ece5d8] transition">
                  Mystery Vault &amp; Quiz
                </Link>
              </li>
              <li>
                <Link to="/concierge" className="hover:text-[#ece5d8] transition">
                  Find It At My Price
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-mono text-[11px] tracking-[0.26em] uppercase text-[#cfa156]">
              House
            </h3>
            <ul className="space-y-2.5 text-sm text-[#9a948a]">
              <li>
                <Link to="/journal" className="hover:text-[#ece5d8] transition">
                  Reborn Atelier Dossiers
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#ece5d8] transition">
                  Collector Wishlist
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#ece5d8] transition">
                  Order Provenance
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[#ece5d8] transition">
                  Collector Access
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h3 className="font-mono text-[11px] tracking-[0.26em] uppercase text-[#cfa156]">
              Authentication Protocol
            </h3>
            <p className="text-xs text-[#9a948a] leading-relaxed">
              Multi-point physical inspection across stitch density, Riri/YKK metallurgy, leather
              grain, and NFC cryptographic seal before dispatch from our HCMC &amp; Tokyo vaults.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#ece5d8]/80">
              <ShieldCheck className="w-4 h-4 text-[#cfa156]" />
              <span>100% PROVENANCE GUARANTEE</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] tracking-widest text-[#9a948a] uppercase">
          <span>© 2026 ENIGMA CULT ARCHIVE · ALL RIGHTS RESERVED</span>
          <span>OBSIDIAN ATELIER · SAIGON / TOKYO / ANTWERP</span>
        </div>
      </div>
    </footer>
  )
}
