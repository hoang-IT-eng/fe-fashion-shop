import { describe, it, expect, beforeEach } from 'vitest'
import { demoHandleRequest, resetDemoVault } from '../api/enigmaDemoEngine'
import { useCartStore } from '../store/useCartStore'
import { useWishlistStore } from '../store/useWishlistStore'
import {
  AiChatResponsePayload,
  AuctionLot,
  ConciergeTicket,
  TasteCodexResult,
} from '../types/enigma'

describe('NOCTURNE Demo Vault Engine & Stores', () => {
  beforeEach(() => {
    localStorage.clear()
    resetDemoVault()
    useCartStore.setState({ items: [], appliedVoucher: null, drawerOpen: false })
    useWishlistStore.getState().clear()
  })

  it('applies NOCTURNE15 privilege discount accurately in useCartStore', async () => {
    await useCartStore.getState().addItem(
      {
        productId: 1,
        name: 'NOCTURNE 01 "Obsidian Monolith" High-Top',
        price: 8900000,
        quantity: 1,
        size: '42',
      },
      false
    )

    const validation = await useCartStore.getState().applyVoucherCode('nocturne15')
    expect(validation.valid).toBe(true)
    expect(validation.isSecretInitiation).toBe(true)
    expect(useCartStore.getState().subtotal()).toBe(8900000)
    expect(useCartStore.getState().discountAmount()).toBe(1335000)
    expect(useCartStore.getState().finalTotal()).toBe(7565000)
  })

  it('toggles and persists Collector Wishlist IDs', () => {
    const added = useWishlistStore.getState().toggle(2)
    expect(added).toBe(true)
    expect(useWishlistStore.getState().has(2)).toBe(true)

    const addedAgain = useWishlistStore.getState().toggle(2)
    expect(addedAgain).toBe(false)
    expect(useWishlistStore.getState().has(2)).toBe(false)
  })

  it('triggers +120s Anti-Snipe extension when bidding on a lot with <60s remaining', async () => {
    const lots = await demoHandleRequest<AuctionLot[]>('GET', '/auctions')
    const snipeLot = lots.find(l => l.id === 3)!
    expect(snipeLot.remainingSeconds).toBeLessThan(60)

    const prevEnd = new Date(snipeLot.endsAt).getTime()
    const res = await demoHandleRequest<{ lot: AuctionLot; extended: boolean }>(
      'POST',
      '/auctions/3/bids',
      { amount: snipeLot.nextMinimumBid, bidderAlias: 'TEST_SNIPE' }
    )

    expect(res.extended).toBe(true)
    expect(res.lot.currentBid).toBe(snipeLot.nextMinimumBid)
    const nextEnd = new Date(res.lot.endsAt).getTime()
    expect(nextEnd - prevEnd).toBeGreaterThanOrEqual(119_000)
  })

  it('decodes 8-step Style Quiz into Taste Codex archetype and matched Mystery Box', async () => {
    const result = await demoHandleRequest<TasteCodexResult>(
      'POST',
      '/mystery-boxes/decode-style',
      {
        silhouette: 'bespoke_sculpted',
        palette: 'chiaroscuro_gold',
        era: 'reborn_artisan',
        footwear: 'custom_bespoke',
        fabric: 'oxidized_silver_silk',
        occasion: 'private_viewing',
        grailPriority: 'numbered_edition',
        riskAppetite: 'grail_vault',
      }
    )

    expect(result.archetypeCode).toBe('NEO_RENAISSANCE')
    expect(result.archetype).toBe('Neo-Renaissance')
    expect(result.matchedTierSlug).toBe('grail-vault')
    expect(result.recommendedBox?.name).toBe('Grail Vault')
  })

  it('creates and counters Concierge Name Your Price mandates', async () => {
    const created = await demoHandleRequest<ConciergeTicket>('POST', '/concierge', {
      requesterName: 'Archive Tester',
      requesterEmail: 'tester@enigma.cult',
      itemName: 'Undercover AW05 Arts & Crafts Denim',
      size: '30',
      targetPrice: 15000000,
    })
    expect(created.status).toBe('pending')

    const countered = await demoHandleRequest<ConciergeTicket>(
      'PATCH',
      `/concierge/${created.id}/review`,
      {
        status: 'countered',
        counterOfferPrice: 16200000,
        adminNotes: 'Pair located in Tokyo partner vault.',
      }
    )
    expect(countered.status).toBe('countered')
    expect(countered.counterOfferPrice).toBe(16200000)
  })

  it('returns Generative UI blocks from Hybrid Local RAG AI Stylist', async () => {
    const compareRes = await demoHandleRequest<AiChatResponsePayload>(
      'POST',
      '/ai-chat/message',
      { message: 'Compare horsehide bomber vs wool overcoat' }
    )
    expect(compareRes.type).toBe('generative_ui')
    expect(compareRes.uiBlocks?.[0]?.kind).toBe('comparison_table')

    const auctionRes = await demoHandleRequest<AiChatResponsePayload>(
      'POST',
      '/ai-chat/message',
      { message: 'Show live auctions' }
    )
    expect(auctionRes.uiBlocks?.[0]?.kind).toBe('auction_card')
  })
})
