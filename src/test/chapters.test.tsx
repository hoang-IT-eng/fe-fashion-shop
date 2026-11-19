import type React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { correctProductImages, correctImageFor } from '../lib/productImages'
import { ToastProvider } from '../components/Toast'
import { NameYourPriceChapter } from '../components/home/chapters/NameYourPriceChapter'
import { ManifestoChapter, MANIFESTO_PANELS } from '../components/home/chapters/ManifestoChapter'
import { AuctionsChapter, ANTI_SNIPE_EXTENSION_S } from '../components/home/chapters/AuctionsChapter'

describe('product image map', () => {
  it('replaces reused placeholder shots with the right painting', () => {
    expect(correctImageFor('Oxidized Sterling Sanctum Chain & Clasp', '/images/enigma/grail-chronograph-relic.jpg')).toBe(
      '/images/enigma/grail-chain-sanctum.jpg'
    )
    expect(correctImageFor('Selvedge Raw Tapered Denim — 16oz Kuroki Mill', '/images/enigma/grail-cargo-vanguard.jpg')).toBe(
      '/images/enigma/grail-denim-kuroki.jpg'
    )
    expect(correctImageFor('Archive Heavyweight Boxy Tee — Chiaroscuro Edition', '/images/enigma/grail-hoodie-shadow.jpg')).toBe(
      '/images/enigma/grail-tee-chiaroscuro.jpg'
    )
  })
  it('never touches correct rows or uploaded images', () => {
    expect(correctImageFor('Nocturne Skeleton Titanium Chronograph & Signet Set', '/images/enigma/grail-chronograph-relic.jpg')).toBe(
      '/images/enigma/grail-chronograph-relic.jpg'
    )
    expect(correctImageFor('Sanctum Chain', 'https://res.cloudinary.com/x/chain.jpg')).toBe('https://res.cloudinary.com/x/chain.jpg')
  })
  it('walks nested API payloads (lists, cart lines)', () => {
    const out = correctProductImages({
      data: [{ id: 10, name: 'Oxidized Sterling Sanctum Chain & Clasp', imageUrl: '/images/enigma/grail-chronograph-relic.jpg' }],
    })
    expect(out.data[0].imageUrl).toBe('/images/enigma/grail-chain-sanctum.jpg')
  })
})

const wrap = (ui: React.ReactNode) =>
  render(
    <ToastProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ToastProvider>
  )

describe('home chapters', () => {
  it('Name your price: every field has a programmatic label', () => {
    wrap(<NameYourPriceChapter />)
    expect(screen.getByLabelText(/Your price \(VND\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adjust your price/i)).toHaveAttribute('type', 'range')
    expect(screen.getByLabelText(/The piece/i)).toBeRequired()
    expect(screen.getByLabelText(/^Size$/i)).toBeRequired()
    expect(screen.getByLabelText(/Email for the reply/i)).toHaveAttribute('type', 'email')
  })
  it('manifesto renders four truthful panels', () => {
    wrap(<ManifestoChapter />)
    expect(MANIFESTO_PANELS).toHaveLength(4)
    expect(screen.getByText('A late bid buys time, not victory.')).toBeInTheDocument()
    expect(screen.queryByText(/cryptograph|NFC/i)).toBeNull()
  })
  it('auctions chapter states the +120s anti-snipe rule', async () => {
    wrap(<AuctionsChapter />)
    expect(ANTI_SNIPE_EXTENSION_S).toBe(120)
    expect(await screen.findByText(`+${ANTI_SNIPE_EXTENSION_S}s`, { selector: 'strong' })).toBeInTheDocument()
  })
})
