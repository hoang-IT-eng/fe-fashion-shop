import { Product } from '../types/product'
import { Category } from '../types/category'
import { CartItem } from '../types/cart'
import { Order, OrderStatus } from '../types/order'
import { ProductVariant } from '../types/variant'
import {
  AiChatResponsePayload,
  AuctionLot,
  ConciergeStatus,
  ConciergeTicket,
  ExecutiveDashboardStats,
  GenerativeUiBlock,
  MysteryBoxTier,
  ReviewItem,
  TasteCodexResult,
  VoucherItem,
  VoucherValidation,
} from '../types/enigma'
import {
  buildInitialAuctions,
  DEMO_QUIZ_STEPS,
  INITIAL_CATEGORIES,
  INITIAL_CONCIERGE,
  INITIAL_MYSTERY_BOXES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_VOUCHERS,
} from './enigmaDemoData'

export interface DemoUserRecord {
  id: number
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  phone?: string
  address?: string
  isVerified?: boolean
  createdAt: string
}

interface StoredStyleProfile {
  id: number
  userId: number | null
  requesterLabel: string
  codex: TasteCodexResult
  updatedAt: string
}

interface DemoVaultState {
  users: DemoUserRecord[]
  categories: Category[]
  products: Product[]
  auctions: AuctionLot[]
  mysteryBoxes: MysteryBoxTier[]
  vouchers: VoucherItem[]
  concierge: ConciergeTicket[]
  reviews: ReviewItem[]
  orders: Order[]
  cartsByOwner: Record<string, CartItem[]>
  styleProfiles: StoredStyleProfile[]
}

const STORAGE_KEY = 'enigma_vault_state_v1'

const INITIAL_USERS: DemoUserRecord[] = [
  {
    id: 1,
    name: 'ENIGMA Curator',
    email: 'admin@fashionshop.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '0909000111',
    address: 'ENIGMA Vault Atelier, District 1, HCMC',
    isVerified: true,
    createdAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 2,
    name: 'Kaelen Vinh',
    email: 'demo@fashionshop.com',
    password: 'Demo@123',
    role: 'user',
    phone: '0909123456',
    address: '88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh',
    isVerified: true,
    createdAt: '2026-10-12T10:00:00.000Z',
  },
  {
    id: 3,
    name: 'Lan Nguyen',
    email: 'lan@fashionshop.com',
    password: 'Demo@123',
    role: 'user',
    phone: '0912345678',
    address: '24 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    isVerified: true,
    createdAt: '2026-10-18T14:00:00.000Z',
  },
]

const ARCHETYPE_CATALOG: Record<
  string,
  {
    archetype: string
    motto: string
    description: string
    paletteNotes: string[]
    categories: string[]
    keywords: string[]
    defaultTier: string
  }
> = {
  SHADOW_ARCHIVE: {
    archetype: 'Shadow Archive',
    motto: 'Patina over polish. Silence over spectacle.',
    description:
      'Rooted in early-2000s subterranean ateliers, sun-faded 650gsm loopwheel jersey, scarred horsehide, and monolithic calfskin silhouettes.',
    paletteNotes: ['Deep Obsidian #070709', 'Smoked Charcoal #111115', 'Sun-Faded Ash #6e6a64'],
    categories: ['Outerwear', 'Hoodies', 'Sneakers'],
    keywords: ['horsehide', 'loopwheel', 'archive', 'distressed', 'obsidian'],
    defaultTier: 'inner-circle-chest',
  },
  CONCRETE_VANGUARD: {
    archetype: 'Concrete Vanguard',
    motto: 'Engineered for nocturnal transit and brutalist geometry.',
    description:
      'Defined by waxed selvedge cargo architecture, articulated gussets, matte gunmetal clasps, and carbon-plated propulsion runners.',
    paletteNotes: ['Chiaroscuro Slate #1c1d24', 'Waxed Obsidian #0d0e12', 'Warm Bone #ece5d8'],
    categories: ['Bottoms', 'Sneakers', 'Outerwear'],
    keywords: ['cargo', 'waxed', 'carbon', 'selvedge', 'vanguard'],
    defaultTier: 'inner-circle-chest',
  },
  NEO_RENAISSANCE: {
    archetype: 'Neo-Renaissance',
    motto: 'Every numbered relic carries its maker’s scar.',
    description:
      'Collector of 1-of-12 Reborn customs, openworked grade-5 titanium horology, and chiaroscuro couture finished with antique gold accents.',
    paletteNotes: ['Obsidian #070709', 'Warm Bone #ece5d8', 'Antique Gold #cfa156'],
    categories: ['Relics', 'Reborn Archive', 'Outerwear'],
    keywords: ['reborn', 'titanium', 'chronograph', 'custom', '1-of-12'],
    defaultTier: 'grail-vault',
  },
  MONOLITH_MINIMALIST: {
    archetype: 'Monolith Minimalist',
    motto: 'Zero ornament. Pure architectural column.',
    description:
      'Devoted to double-faced 780g virgin wool-cashmere, concealed horn plackets, unwashed Kuroki raw denim, and lifetime structural drape.',
    paletteNotes: ['Deep Obsidian #070709', 'Warm Bone #ece5d8', 'Muted Pewter #9a948a'],
    categories: ['Reborn Archive', 'Bottoms', 'Hoodies'],
    keywords: ['monolith', 'wool', 'overcoat', 'raw', 'tailored'],
    defaultTier: 'initiate-box',
  },
}

let memoryFallback: DemoVaultState | null = null

function clone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T
}

function createSeedState(): DemoVaultState {
  const boxes = clone(INITIAL_MYSTERY_BOXES)
  return {
    users: clone(INITIAL_USERS),
    categories: clone(INITIAL_CATEGORIES),
    products: clone(INITIAL_PRODUCTS),
    auctions: buildInitialAuctions(),
    mysteryBoxes: boxes,
    vouchers: clone(INITIAL_VOUCHERS),
    concierge: clone(INITIAL_CONCIERGE),
    reviews: clone(INITIAL_REVIEWS),
    orders: clone(INITIAL_ORDERS),
    cartsByOwner: {},
    styleProfiles: [
      {
        id: 1,
        userId: 2,
        requesterLabel: 'Kaelen Vinh',
        codex: {
          archetypeCode: 'SHADOW_ARCHIVE',
          archetype: 'Shadow Archive',
          motto: ARCHETYPE_CATALOG.SHADOW_ARCHIVE.motto,
          description: ARCHETYPE_CATALOG.SHADOW_ARCHIVE.description,
          paletteNotes: ARCHETYPE_CATALOG.SHADOW_ARCHIVE.paletteNotes,
          categories: ARCHETYPE_CATALOG.SHADOW_ARCHIVE.categories,
          keywords: ARCHETYPE_CATALOG.SHADOW_ARCHIVE.keywords,
          dnaBreakdown: [
            { code: 'SHADOW_ARCHIVE', archetype: 'Shadow Archive', affinityPercent: 50 },
            { code: 'NEO_RENAISSANCE', archetype: 'Neo-Renaissance', affinityPercent: 25 },
            { code: 'CONCRETE_VANGUARD', archetype: 'Concrete Vanguard', affinityPercent: 13 },
            { code: 'MONOLITH_MINIMALIST', archetype: 'Monolith Minimalist', affinityPercent: 12 },
          ],
          matchedTierSlug: 'inner-circle-chest',
          recommendedBox: boxes.find(b => b.tierSlug === 'inner-circle-chest') || null,
          persisted: true,
        },
        updatedAt: '2026-11-15T18:00:00.000Z',
      },
      {
        id: 2,
        userId: 3,
        requesterLabel: 'Lan Nguyen',
        codex: {
          archetypeCode: 'NEO_RENAISSANCE',
          archetype: 'Neo-Renaissance',
          motto: ARCHETYPE_CATALOG.NEO_RENAISSANCE.motto,
          description: ARCHETYPE_CATALOG.NEO_RENAISSANCE.description,
          paletteNotes: ARCHETYPE_CATALOG.NEO_RENAISSANCE.paletteNotes,
          categories: ARCHETYPE_CATALOG.NEO_RENAISSANCE.categories,
          keywords: ARCHETYPE_CATALOG.NEO_RENAISSANCE.keywords,
          dnaBreakdown: [
            { code: 'NEO_RENAISSANCE', archetype: 'Neo-Renaissance', affinityPercent: 63 },
            { code: 'MONOLITH_MINIMALIST', archetype: 'Monolith Minimalist', affinityPercent: 25 },
            { code: 'SHADOW_ARCHIVE', archetype: 'Shadow Archive', affinityPercent: 12 },
            { code: 'CONCRETE_VANGUARD', archetype: 'Concrete Vanguard', affinityPercent: 0 },
          ],
          matchedTierSlug: 'grail-vault',
          recommendedBox: boxes.find(b => b.tierSlug === 'grail-vault') || null,
          persisted: true,
        },
        updatedAt: '2026-11-16T09:00:00.000Z',
      },
    ],
  }
}

function loadState(): DemoVaultState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as DemoVaultState
        // Keep live demo auctions ticking if stored timestamps went completely stale across days
        const anyLiveActive = parsed.auctions?.some(
          lot => lot.status === 'live' && new Date(lot.endsAt).getTime() > Date.now()
        )
        if (!anyLiveActive && parsed.auctions?.length) {
          parsed.auctions = buildInitialAuctions()
        }
        return parsed
      }
    } catch {
      // ignore storage errors
    }
  }
  if (!memoryFallback) {
    memoryFallback = createSeedState()
  }
  const seeded = memoryFallback
  saveState(seeded)
  return seeded
}

function saveState(state: DemoVaultState): void {
  memoryFallback = state
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }
}

export function resetDemoVault(): void {
  const fresh = createSeedState()
  saveState(fresh)
}

function resolveUser(state: DemoVaultState, token: string | null): DemoUserRecord | null {
  if (!token) return null
  if (token.startsWith('enigma-demo-jwt:')) {
    const id = Number(token.split(':')[1])
    return state.users.find(u => u.id === id) || null
  }
  try {
    const rawUser = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null
    if (rawUser) {
      const parsed = JSON.parse(rawUser) as { id?: number; email?: string }
      return (
        state.users.find(u => u.id === parsed.id || u.email === parsed.email) || null
      )
    }
  } catch {
    // ignore
  }
  return null
}

function cartOwnerKey(user: DemoUserRecord | null): string {
  return user ? `user:${user.id}` : 'guest'
}

function hydrateLot(lot: AuctionLot): AuctionLot {
  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(lot.endsAt).getTime() - Date.now()) / 1000)
  )
  const nextMinimumBid =
    lot.bidCount === 0 ? Number(lot.startingBid) : Number(lot.currentBid) + Number(lot.minIncrement)
  const reserveMet = lot.reservePrice == null || Number(lot.currentBid) >= Number(lot.reservePrice)
  return {
    ...lot,
    remainingSeconds,
    nextMinimumBid,
    reserveMet,
    bids: [...(lot.bids || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  }
}

function evaluateVoucher(
  state: DemoVaultState,
  rawCode: string,
  orderAmount: number
): VoucherValidation {
  const code = String(rawCode || '').trim().toUpperCase()
  if (!code) {
    throw new Error('Please enter a privilege or voucher code.')
  }
  const voucher = state.vouchers.find(v => v.code.toUpperCase() === code)
  if (!voucher || !voucher.isActive) {
    throw new Error(`Code "${code}" was not recognized in the ENIGMA Vault.`)
  }
  if (voucher.expiresAt && new Date(voucher.expiresAt).getTime() < Date.now()) {
    throw new Error(`Code "${code}" has expired.`)
  }
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
    throw new Error(`Code "${code}" has reached its allocation limit.`)
  }
  if (orderAmount < voucher.minOrderAmount) {
    throw new Error(
      `Code "${code}" requires a minimum order of ${voucher.minOrderAmount.toLocaleString('vi-VN')}₫.`
    )
  }

  let discountAmount =
    voucher.discountType === 'percentage'
      ? Math.round((orderAmount * voucher.discountValue) / 100)
      : Math.round(voucher.discountValue)

  if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
    discountAmount = voucher.maxDiscountAmount
  }
  discountAmount = Math.min(discountAmount, Math.max(0, orderAmount))

  return {
    valid: true,
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    discountAmount,
    finalTotal: Math.max(0, orderAmount - discountAmount),
    isSecretInitiation: voucher.isSecretInitiation,
    message: voucher.isSecretInitiation
      ? 'Inner Circle privilege verified — 15% Initiation credit unlocked.'
      : `Privilege ${voucher.code} applied.`,
  }
}

function scoreQuizAnswers(
  state: DemoVaultState,
  answers: Record<string, string>,
  user: DemoUserRecord | null
): TasteCodexResult {
  const scores: Record<string, number> = {
    SHADOW_ARCHIVE: 0,
    CONCRETE_VANGUARD: 0,
    NEO_RENAISSANCE: 0,
    MONOLITH_MINIMALIST: 0,
  }

  for (const step of DEMO_QUIZ_STEPS) {
    const picked = answers[step.field]
    const matchedOption = step.options.find(opt => opt.value === picked)
    if (matchedOption && scores[matchedOption.archetype] !== undefined) {
      scores[matchedOption.archetype] += step.field === 'grailPriority' ? 2 : 1
    }
  }

  const totalPoints = Object.values(scores).reduce((s, v) => s + v, 0) || 1
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const winnerCode = sorted[0][0]
  const meta = ARCHETYPE_CATALOG[winnerCode] || ARCHETYPE_CATALOG.SHADOW_ARCHIVE

  let matchedTierSlug = meta.defaultTier
  if (answers.riskAppetite === 'initiate') matchedTierSlug = 'initiate-box'
  if (answers.riskAppetite === 'inner_circle' || answers.riskAppetite === 'vanguard_pack') {
    matchedTierSlug = 'inner-circle-chest'
  }
  if (answers.riskAppetite === 'grail_vault') matchedTierSlug = 'grail-vault'

  const recommendedBox =
    state.mysteryBoxes.find(b => b.tierSlug === matchedTierSlug) || state.mysteryBoxes[0] || null

  const dnaBreakdown = sorted.map(([code, pts]) => ({
    code,
    archetype: ARCHETYPE_CATALOG[code].archetype,
    affinityPercent: Math.round((pts / totalPoints) * 100),
  }))

  const result: TasteCodexResult = {
    archetypeCode: winnerCode,
    archetype: meta.archetype,
    motto: meta.motto,
    description: meta.description,
    paletteNotes: meta.paletteNotes,
    categories: meta.categories,
    keywords: meta.keywords,
    dnaBreakdown,
    matchedTierSlug,
    recommendedBox,
    persisted: Boolean(user),
  }

  const existingIdx = user
    ? state.styleProfiles.findIndex(p => p.userId === user.id)
    : -1
  const record: StoredStyleProfile = {
    id: existingIdx >= 0 ? state.styleProfiles[existingIdx].id : state.styleProfiles.length + 1,
    userId: user ? user.id : null,
    requesterLabel: user ? user.name : 'Guest Initiate',
    codex: result,
    updatedAt: new Date().toISOString(),
  }
  if (existingIdx >= 0) {
    state.styleProfiles[existingIdx] = record
  } else {
    state.styleProfiles.unshift(record)
  }
  saveState(state)
  return result
}

function buildExecutiveDashboard(state: DemoVaultState): ExecutiveDashboardStats {
  const nonCancelled = state.orders.filter(o => o.status !== 'cancelled')
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = state.orders.length
  const averageOrderValue = nonCancelled.length
    ? Math.round(totalRevenue / nonCancelled.length)
    : 0

  const ordersByStatus = {
    pending: state.orders.filter(o => o.status === 'pending').length,
    confirmed: state.orders.filter(o => o.status === 'confirmed').length,
    shipping: state.orders.filter(o => o.status === 'shipping').length,
    delivered: state.orders.filter(o => o.status === 'delivered').length,
    cancelled: state.orders.filter(o => o.status === 'cancelled').length,
  }

  const fulfillmentRate = totalOrders
    ? Math.round((ordersByStatus.delivered / totalOrders) * 100)
    : 0
  const activePipelineRate = totalOrders
    ? Math.round(
        ((ordersByStatus.pending + ordersByStatus.confirmed + ordersByStatus.shipping) /
          totalOrders) *
          100
      )
    : 0
  const cancellationRate = totalOrders
    ? Math.round((ordersByStatus.cancelled / totalOrders) * 100)
    : 0

  const now = Date.now()
  const gmvTimeSeries = Array.from({ length: 7 }, (_, idx) => {
    const dayOffset = 6 - idx
    const d = new Date(now - dayOffset * 86400_000)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    const dayOrders = nonCancelled.filter(o => {
      const od = new Date(o.createdAt)
      return od.toDateString() === d.toDateString()
    })
    const baseline = [14200000, 18900000, 12600000, 26400000, 21800000, 31200000, 28900000][idx]
    const actual = dayOrders.reduce((s, o) => s + Number(o.total), 0)
    return {
      date: label,
      gmv: actual > 0 ? actual + baseline * 0.35 : baseline,
      orders: dayOrders.length || [2, 3, 2, 4, 3, 5, 4][idx],
    }
  })

  const catMap = new Map<string, { units: number; revenue: number }>()
  const sizeMap = new Map<string, number>()
  const colorMap = new Map<string, number>()

  for (const order of nonCancelled) {
    for (const item of order.items) {
      const prod = state.products.find(p => p.id === item.productId)
      const cat = prod?.category || 'Archive'
      const cur = catMap.get(cat) || { units: 0, revenue: 0 }
      cur.units += item.quantity
      cur.revenue += item.price * item.quantity
      catMap.set(cat, cur)
      if (item.size) sizeMap.set(item.size, (sizeMap.get(item.size) || 0) + item.quantity)
      if (item.color) colorMap.set(item.color, (colorMap.get(item.color) || 0) + item.quantity)
    }
  }

  // Enrich velocity with catalog baselines if few orders exist
  for (const p of state.products) {
    if (!catMap.has(p.category || 'Archive')) {
      catMap.set(p.category || 'Archive', { units: 2, revenue: p.price * 2 })
    }
  }

  const categoryVelocity = Array.from(catMap.entries())
    .map(([category, v]) => ({ category, units: v.units, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  const sizeVelocity = (
    sizeMap.size
      ? Array.from(sizeMap.entries()).map(([size, units]) => ({ size, units }))
      : [
          { size: '42', units: 9 },
          { size: 'L', units: 8 },
          { size: 'M', units: 7 },
          { size: '30', units: 5 },
        ]
  ).sort((a, b) => b.units - a.units)

  const colorVelocity = (
    colorMap.size
      ? Array.from(colorMap.entries()).map(([color, units]) => ({ color, units }))
      : [
          { color: 'Obsidian', units: 12 },
          { color: 'Smoked Charcoal', units: 8 },
          { color: 'Obsidian Patina', units: 5 },
        ]
  ).sort((a, b) => b.units - a.units)

  const hydratedLots = state.auctions.map(hydrateLot)
  const liveLots = hydratedLots.filter(l => l.status === 'live')
  const totalBids = hydratedLots.reduce((s, l) => s + l.bidCount, 0)
  const highestActiveBid = liveLots.reduce((m, l) => Math.max(m, l.currentBid), 0)
  const activeAuctionValue = liveLots.reduce((s, l) => s + l.currentBid, 0)

  const lowStockSkus: ExecutiveDashboardStats['lowStockSkus'] = []
  for (const p of state.products) {
    for (const v of p.variants || []) {
      if (v.stock <= 3) {
        lowStockSkus.push({
          variantId: v.id,
          productId: p.id,
          productName: p.name,
          sku: v.sku || `ENG-${p.id}-${v.id}`,
          size: v.size || null,
          color: v.color || null,
          stock: v.stock,
        })
      }
    }
  }
  lowStockSkus.sort((a, b) => a.stock - b.stock)

  const codexCounts = new Map<string, number>()
  for (const sp of state.styleProfiles) {
    codexCounts.set(sp.codex.archetype, (codexCounts.get(sp.codex.archetype) || 0) + 1)
  }

  return {
    totalUsers: state.users.length,
    totalProducts: state.products.length,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    pendingOrders: ordersByStatus.pending,
    newOrdersToday: state.orders.filter(
      o => Date.now() - new Date(o.createdAt).getTime() < 86400_000 * 2
    ).length,
    ordersByStatus,
    conversionBreakdown: {
      fulfillmentRate,
      activePipelineRate,
      cancellationRate,
    },
    gmvTimeSeries,
    categoryVelocity,
    sizeVelocity,
    colorVelocity,
    auctionHeat: {
      liveCount: liveLots.length,
      totalLots: hydratedLots.length,
      totalBids,
      highestActiveBid,
      activeAuctionValue,
      hotLots: liveLots.slice(0, 4).map(l => ({
        id: l.id,
        title: l.title,
        currentBid: l.currentBid,
        bidCount: l.bidCount,
        endsAt: l.endsAt,
      })),
    },
    lowStockSkus: lowStockSkus.slice(0, 8),
    pendingConciergeCount: state.concierge.filter(
      c => c.status === 'pending' || c.status === 'reviewing'
    ).length,
    recentConciergeRequests: state.concierge.slice(0, 5).map(c => ({
      id: c.id,
      requesterName: c.requesterName,
      itemName: c.itemName,
      size: c.size,
      targetPrice: c.targetPrice,
      status: c.status,
      createdAt: c.createdAt,
    })),
    codexDistribution: Array.from(codexCounts.entries()).map(([archetype, count]) => ({
      archetype,
      count,
    })),
  }
}

function handleAiStylistMessage(
  state: DemoVaultState,
  body: Record<string, unknown>,
  user: DemoUserRecord | null
): AiChatResponsePayload {
  const rawMessage = String(body?.message || '').trim()
  const q = rawMessage.toLowerCase()
  const sessionId = String(body?.sessionId || `enigma-session-${Date.now()}`)
  const toolsInvoked: string[] = []
  const uiBlocks: GenerativeUiBlock[] = []

  // 1. Live Auctions Intent
  if (/\b(auctions?|bids?|bidding|lots?|snipe|dau gia|đấu giá)\b/i.test(q)) {
    toolsInvoked.push('get_live_auctions')
    const lots = state.auctions
      .map(hydrateLot)
      .filter(l => l.status === 'live')
      .slice(0, 3)
    uiBlocks.push({
      kind: 'auction_card',
      title: 'LIVE GRAIL AUCTIONS · ANTI-SNIPE PROTECTED',
      lots: lots.map(l => ({
        id: l.id,
        title: l.title,
        subtitle: l.subtitle,
        imageUrl: l.imageUrl,
        currentBid: l.currentBid,
        nextMinimumBid: l.nextMinimumBid,
        bidCount: l.bidCount,
        endsAt: l.endsAt,
        remainingSeconds: l.remainingSeconds,
        reserveMet: l.reserveMet,
      })),
    })
    return {
      type: 'generative_ui',
      sessionId,
      engine: 'hybrid-local-rag',
      toolsInvoked,
      message:
        'Here are the live Grail Lots currently on the block. Any bid placed inside the final 60 seconds triggers an automatic +120s Anti-Snipe extension.',
      uiBlocks,
    }
  }

  // 2. Order Tracking Intent
  if (/\b(orders?|track|tracking|shipping|delivery|don hang|đơn hàng)\b|#?\d{4}/i.test(q)) {
    toolsInvoked.push('get_order_status')
    const idMatch = q.match(/#?(\d{4})/)
    const targetOrder = idMatch
      ? state.orders.find(o => o.id === Number(idMatch[1]))
      : (user ? state.orders.find(o => o.userId === user.id) : null) || state.orders[0]

    if (targetOrder) {
      const stageKeys = ['pending', 'confirmed', 'shipping', 'delivered']
      const idx = Math.max(0, stageKeys.indexOf(targetOrder.status))
      uiBlocks.push({
        kind: 'order_stepper',
        title: `PROVENANCE DISPATCH · ORDER #${targetOrder.id}`,
        order: {
          id: targetOrder.id,
          status: targetOrder.status,
          paymentMethod: targetOrder.paymentMethod,
          paymentStatus: targetOrder.paymentStatus || 'unpaid',
          total: targetOrder.total,
          createdAt: targetOrder.createdAt,
          itemCount: targetOrder.items.reduce((s, i) => s + i.quantity, 0),
          currentStageIndex: idx,
          stages: [
            { key: 'pending', label: 'Vault Reserved', completed: idx >= 0 },
            { key: 'confirmed', label: 'NFC Authenticated', completed: idx >= 1 },
            { key: 'shipping', label: 'Armored Transit', completed: idx >= 2 },
            { key: 'delivered', label: 'Collector Signed', completed: idx >= 3 },
          ],
        },
      })
      return {
        type: 'generative_ui',
        sessionId,
        engine: 'hybrid-local-rag',
        toolsInvoked,
        message: `Located Order #${targetOrder.id} (${targetOrder.status.toUpperCase()}). Your provenance seal and fulfillment telemetry are rendered below.`,
        uiBlocks,
      }
    }
  }

  // 3. Coupon / Initiation Code Intent
  if (/\b(coupons?|vouchers?|codes?|discounts?|enigma15|cult10|ma giam|mã giảm)\b/i.test(q)) {
    toolsInvoked.push('validate_coupon')
    const codeMatch = rawMessage.match(/\b(ENIGMA15|CULT10|VAULT500K)\b/i)
    const checkCode = codeMatch ? codeMatch[1].toUpperCase() : 'ENIGMA15'
    const v = evaluateVoucher(state, checkCode, 10000000)
    return {
      type: 'text',
      sessionId,
      engine: 'hybrid-local-rag',
      toolsInvoked,
      message: `${v.message} (${v.code}: ${v.description}). Tip: Type ENIGMA anywhere outside an input field to trigger the Inner Circle Initiation ceremony directly.`,
    }
  }

  // 4. Mystery Box / Style Quiz Intent
  if (/\b(quiz|codex|mystery|archetype|decode|box|chest|vault)\b/i.test(q) && !q.includes('compare')) {
    const userCodex = user ? state.styleProfiles.find(p => p.userId === user.id)?.codex : null
    uiBlocks.push({
      kind: 'taste_codex_prompt',
      title: userCodex ? `YOUR CODEX · ${userCodex.archetype.toUpperCase()}` : 'DECODE YOUR TASTE CODEX',
      subtitle: userCodex
        ? userCodex.motto
        : 'Complete the 8-step chromatic & silhouette calibration to unlock your matched Mystery Vault.',
      currentArchetype: userCodex?.archetype || null,
      suggestedTierSlug: userCodex?.matchedTierSlug || 'inner-circle-chest',
      ctaUrl: '/mystery-boxes',
    })
    return {
      type: 'generative_ui',
      sessionId,
      engine: 'hybrid-local-rag',
      toolsInvoked: ['decode_taste_codex'],
      message: userCodex
        ? `Your active Taste Codex is ${userCodex.archetype}, paired with the ${userCodex.recommendedBox?.name || 'Inner Circle Chest'}.`
        : 'Every Mystery Allocation begins with the 8-step Taste Codex calibration. Launch the decoder below:',
      uiBlocks,
    }
  }

  // 5. Side-by-Side Grail Comparison Intent
  if (/\b(compare|vs|versus|so sanh|so sánh|difference)\b/i.test(q)) {
    toolsInvoked.push('search_products_hybrid', 'check_variant_stock')
    const scored = scoreProductsBM25(state.products, q)
    const pair = (scored.length >= 2 ? scored : state.products).slice(0, 2)
    uiBlocks.push({
      kind: 'comparison_table',
      title: 'SIDE-BY-SIDE GRAIL SPECIFICATION',
      columns: pair.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand || 'ENIGMA',
        category: p.category || 'Archive',
        price: p.price,
        releaseType: (p.releaseType || 'drop').toUpperCase(),
        condition: p.condition || 'Deadstock',
        sizes: (p.sizes || []).join(', '),
        colors: (p.colors || []).join(', '),
        stock: p.stock,
        imageUrl: p.imageUrl,
      })),
      verdict: `${pair[0].name} leads in collector rarity (${pair[0].condition || 'Vault Sealed'}), while ${pair[1].name} anchors daily archival rotation.`,
    })
    return {
      type: 'generative_ui',
      sessionId,
      engine: 'hybrid-local-rag',
      toolsInvoked,
      message: `Prepared an architectural specification matrix comparing ${pair[0].name} and ${pair[1].name}:`,
      uiBlocks,
    }
  }

  // 6. Default: Hybrid BM25 Product + SKU Variant Search
  toolsInvoked.push('search_products_hybrid', 'check_variant_stock')
  const matched = scoreProductsBM25(state.products, q)
  const picks = (matched.length > 0 ? matched : state.products.slice(0, 3)).slice(0, 3)

  uiBlocks.push({
    kind: 'product_cards',
    title: 'CURATED ARCHIVE ALLOCATIONS',
    products: picks.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      releaseType: p.releaseType,
      condition: p.condition,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      sizes: p.sizes || [],
      colors: p.colors || [],
      variants: (p.variants || []).map(v => ({
        id: v.id,
        size: v.size || null,
        color: v.color || null,
        stock: v.stock,
        sku: v.sku || null,
      })),
    })),
  })

  return {
    type: 'generative_ui',
    sessionId,
    engine: 'hybrid-local-rag',
    toolsInvoked,
    message:
      matched.length > 0
        ? `Selected ${picks.length} authenticated pieces from the ENIGMA Vault matching your criteria. Select a size directly on any card to reserve:`
        : 'Welcome to the ENIGMA Grail Desk. Here are three flagship pieces from our current drop—select a size inline or ask me to compare pieces, inspect live auctions, or track an order:',
    uiBlocks,
  }
}

function scoreProductsBM25(products: Product[], query: string): Product[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2)

  // Map common Vietnamese/English fashion synonyms
  const expanded = new Set(tokens)
  if (tokens.some(t => ['giày', 'giay', 'shoe', 'shoes', 'sneaker', 'runner', 'boot'].includes(t))) {
    expanded.add('sneakers')
    expanded.add('high-top')
    expanded.add('runner')
  }
  if (tokens.some(t => ['áo', 'ao', 'jacket', 'coat', 'bomber', 'outerwear'].includes(t))) {
    expanded.add('outerwear')
    expanded.add('bomber')
    expanded.add('overcoat')
  }
  if (tokens.some(t => ['hoodie', 'nỉ', 'sweater'].includes(t))) {
    expanded.add('hoodies')
    expanded.add('hoodie')
  }
  if (tokens.some(t => ['quần', 'quan', 'pants', 'cargo', 'jeans', 'denim', 'trousers'].includes(t))) {
    expanded.add('bottoms')
    expanded.add('cargo')
    expanded.add('denim')
  }
  if (tokens.some(t => ['đồng', 'watch', 'ring', 'relic', 'chronograph'].includes(t))) {
    expanded.add('relics')
    expanded.add('chronograph')
  }

  if (expanded.size === 0) return []

  return products
    .map(p => {
      const hay = [
        p.name,
        p.brand,
        p.category,
        p.releaseType,
        p.condition,
        p.description,
        ...(p.sizes || []),
        ...(p.colors || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      let score = 0
      for (const term of expanded) {
        if (hay.includes(term)) {
          score += p.name.toLowerCase().includes(term) ? 4 : 2
        }
      }
      return { p, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.p)
}

export async function demoHandleRequest<T>(
  method: string,
  rawPath: string,
  body?: unknown,
  token: string | null = null
): Promise<T> {
  const state = loadState()
  const user = resolveUser(state, token)
  const [pathname, search = ''] = rawPath.split('?')
  const params = new URLSearchParams(search)
  const payload = (body && typeof body === 'object' ? body : {}) as Record<string, any>

  // ── AUTH ───────────────────────────────────────────────────────
  if (method === 'POST' && pathname === '/auth/login') {
    const email = String(payload.email || '').trim().toLowerCase()
    const password = String(payload.password || '')
    const found = state.users.find(
      u => u.email.toLowerCase() === email && u.password === password
    )
    if (!found) {
      throw new Error('Invalid email or password. Try demo@fashionshop.com / Demo@123.')
    }
    return {
      accessToken: `enigma-demo-jwt:${found.id}`,
      user: { id: found.id, name: found.name, email: found.email, role: found.role },
    } as T
  }

  if (method === 'POST' && pathname === '/auth/register') {
    const email = String(payload.email || '').trim().toLowerCase()
    if (!email || !payload.password) {
      throw new Error('Name, email, and password are required.')
    }
    if (state.users.some(u => u.email.toLowerCase() === email)) {
      throw new Error('An account with this email already exists in the Vault.')
    }
    const newUser: DemoUserRecord = {
      id: Math.max(0, ...state.users.map(u => u.id)) + 1,
      name: String(payload.name || email.split('@')[0]),
      email,
      password: String(payload.password),
      role: 'user',
      isVerified: true,
      createdAt: new Date().toISOString(),
    }
    state.users.push(newUser)
    saveState(state)
    return {
      message: 'Inner Circle registration complete. Your account is verified and ready to sign in.',
    } as T
  }

  if (pathname === '/auth/forgot-password' || pathname === '/auth/reset-password' || pathname.startsWith('/auth/verify-email')) {
    return { message: 'Vault security request processed successfully.' } as T
  }

  // ── USERS ──────────────────────────────────────────────────────
  if (pathname === '/users/me' || pathname === '/users/profile') {
    const active = user || state.users[1]
    if (method === 'GET') {
      return {
        id: active.id,
        name: active.name,
        email: active.email,
        role: active.role,
        phone: active.phone || '',
        address: active.address || '',
      } as T
    }
    if (method === 'PUT' || method === 'PATCH') {
      active.name = payload.name ?? active.name
      active.phone = payload.phone ?? active.phone
      active.address = payload.address ?? active.address
      saveState(state)
      return {
        id: active.id,
        name: active.name,
        email: active.email,
        role: active.role,
        phone: active.phone || '',
        address: active.address || '',
      } as T
    }
  }

  if (pathname === '/users/change-password') {
    return { message: 'Passkey updated successfully.' } as T
  }

  if (method === 'GET' && pathname === '/users') {
    return state.users.map(({ password: _p, ...rest }) => rest) as T
  }

  if (method === 'POST' && pathname === '/users') {
    const created: DemoUserRecord = {
      id: Math.max(0, ...state.users.map(u => u.id)) + 1,
      name: String(payload.name || 'Collector'),
      email: String(payload.email || `collector${Date.now()}@enigma.cult`),
      password: String(payload.password || 'Demo@123'),
      role: payload.role === 'admin' ? 'admin' : 'user',
      isVerified: true,
      createdAt: new Date().toISOString(),
    }
    state.users.push(created)
    saveState(state)
    const { password: _p, ...safe } = created
    return safe as T
  }

  const userMatch = pathname.match(/^\/users\/(\d+)$/)
  if (userMatch) {
    const uid = Number(userMatch[1])
    const idx = state.users.findIndex(u => u.id === uid)
    if (idx < 0) throw new Error('Collector not found.')
    if (method === 'PUT' || method === 'PATCH') {
      state.users[idx] = {
        ...state.users[idx],
        name: payload.name ?? state.users[idx].name,
        role: payload.role ?? state.users[idx].role,
        phone: payload.phone ?? state.users[idx].phone,
        address: payload.address ?? state.users[idx].address,
      }
      saveState(state)
      const { password: _p, ...safe } = state.users[idx]
      return safe as T
    }
    if (method === 'DELETE') {
      state.users.splice(idx, 1)
      saveState(state)
      return { message: 'Deleted' } as T
    }
  }

  // ── CATEGORIES ─────────────────────────────────────────────────
  if (method === 'GET' && pathname === '/categories') {
    return state.categories.filter(c => c.isActive !== false) as T
  }
  if (method === 'GET' && pathname === '/categories/all') {
    return state.categories as T
  }
  if (method === 'POST' && pathname === '/categories') {
    const name = String(payload.name || 'New Capsule')
    const cat: Category = {
      id: Math.max(0, ...state.categories.map(c => c.id)) + 1,
      name,
      slug: payload.slug || name,
      imageUrl: payload.imageUrl || '/images/enigma/grail-hoodie-shadow.jpg',
      isActive: true,
    }
    state.categories.push(cat)
    saveState(state)
    return cat as T
  }
  const catToggleMatch = pathname.match(/^\/categories\/(\d+)\/toggle$/)
  if (catToggleMatch && method === 'PATCH') {
    const cid = Number(catToggleMatch[1])
    const cat = state.categories.find(c => c.id === cid)
    if (!cat) throw new Error('Category not found')
    cat.isActive = !cat.isActive
    saveState(state)
    return cat as T
  }
  const catIdMatch = pathname.match(/^\/categories\/(\d+)$/)
  if (catIdMatch) {
    const cid = Number(catIdMatch[1])
    const idx = state.categories.findIndex(c => c.id === cid)
    if (idx < 0) throw new Error('Category not found')
    if (method === 'PUT' || method === 'PATCH') {
      state.categories[idx] = { ...state.categories[idx], ...payload }
      saveState(state)
      return state.categories[idx] as T
    }
    if (method === 'DELETE') {
      state.categories.splice(idx, 1)
      saveState(state)
      return { message: 'Category removed' } as T
    }
  }

  // ── PRODUCTS, VARIANTS & REVIEWS ───────────────────────────────
  if (method === 'GET' && pathname === '/products') {
    const q = (params.get('search') || '').trim().toLowerCase()
    const category = (params.get('category') || '').trim()
    const brand = (params.get('brand') || '').trim()
    const releaseType = (params.get('releaseType') || '').trim()
    const size = (params.get('size') || '').trim()
    const minPrice = params.get('minPrice') ? Number(params.get('minPrice')) : null
    const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : null
    const sort = params.get('sort') || 'newest'
    const includeInactive = params.get('includeInactive') === 'true'
    const page = Math.max(1, Number(params.get('page') || 1))
    const limit = Math.max(1, Number(params.get('limit') || 24))

    let list = state.products.filter(p => includeInactive || p.isActive !== false)
    if (q) {
      list = list.filter(p =>
        [p.name, p.brand, p.category, p.description, p.authenticityCode]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    if (category) {
      list = list.filter(p => (p.category || '').toLowerCase() === category.toLowerCase())
    }
    if (brand) {
      list = list.filter(p => (p.brand || '').toLowerCase() === brand.toLowerCase())
    }
    if (releaseType) {
      list = list.filter(p => (p.releaseType || '').toLowerCase() === releaseType.toLowerCase())
    }
    if (size) {
      list = list.filter(
        p =>
          (p.sizes || []).includes(size) ||
          (p.variants || []).some(v => v.size === size && v.stock > 0)
      )
    }
    if (minPrice !== null && !Number.isNaN(minPrice)) {
      list = list.filter(p => Number(p.price) >= minPrice)
    }
    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
      list = list.filter(p => Number(p.price) <= maxPrice)
    }

    if (sort === 'price_asc' || sort === 'price-asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sort === 'price_desc' || sort === 'price-desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price))
    } else if (sort === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      list.sort((a, b) => b.id - a.id)
    }

    const total = list.length
    const start = (page - 1) * limit
    const data = list.slice(start, start + limit)
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    } as T
  }

  if (method === 'POST' && pathname === '/products') {
    const nextId = Math.max(0, ...state.products.map(p => p.id)) + 1
    const created: Product = {
      id: nextId,
      name: String(payload.name || 'Untitled Archive Piece'),
      brand: payload.brand || 'ENIGMA ATELIER',
      releaseType: payload.releaseType || 'drop',
      condition: payload.condition || 'Deadstock',
      authenticityCode: payload.authenticityCode || `ENG-2026-${String(nextId).padStart(3, '0')}`,
      description: payload.description || '',
      price: Number(payload.price || 0),
      stock: Number(payload.stock ?? 10),
      category: payload.category || 'Outerwear',
      imageUrl: payload.imageUrl || '/images/enigma/grail-leather-bomber.jpg',
      sizes: Array.isArray(payload.sizes) ? payload.sizes : ['M', 'L'],
      colors: Array.isArray(payload.colors) ? payload.colors : ['Obsidian'],
      variants: [],
      isActive: payload.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    created.variants = (created.sizes || ['One Size']).map((sz, i) => ({
      id: nextId * 100 + i + 1,
      productId: nextId,
      size: sz,
      color: created.colors?.[0] || 'Obsidian',
      stock: Math.max(1, Math.floor(created.stock / Math.max(1, (created.sizes || []).length))),
      sku: `ENG-${nextId}-${sz}`,
    }))
    state.products.unshift(created)
    saveState(state)
    return created as T
  }

  const relatedMatch = pathname.match(/^\/products\/(\d+)\/related$/)
  if (relatedMatch && method === 'GET') {
    const pid = Number(relatedMatch[1])
    const current = state.products.find(p => p.id === pid)
    const related = state.products
      .filter(p => p.id !== pid && p.isActive !== false)
      .sort((a, b) =>
        (a.category === current?.category ? -1 : 1) - (b.category === current?.category ? -1 : 1)
      )
      .slice(0, 4)
    return related as T
  }

  const reviewsMatch = pathname.match(/^\/products\/(\d+)\/reviews$/)
  if (reviewsMatch) {
    const pid = Number(reviewsMatch[1])
    if (method === 'GET') {
      const items = state.reviews
        .filter(r => r.productId === pid)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return items as T
    }
    if (method === 'POST') {
      const rev: ReviewItem = {
        id: Math.max(0, ...state.reviews.map(r => r.id)) + 1,
        userId: user?.id || 2,
        userName: user?.name || 'Verified Collector',
        productId: pid,
        rating: Math.min(5, Math.max(1, Number(payload.rating || 5))),
        comment: String(payload.comment || ''),
        verifiedBuyer: true,
        createdAt: new Date().toISOString(),
      }
      state.reviews.unshift(rev)
      saveState(state)
      return rev as T
    }
  }

  const variantsListMatch = pathname.match(/^\/products\/(\d+)\/variants$/)
  if (variantsListMatch) {
    const pid = Number(variantsListMatch[1])
    const prod = state.products.find(p => p.id === pid)
    if (!prod) throw new Error('Product not found')
    if (method === 'GET') {
      return (prod.variants || []) as T
    }
    if (method === 'POST') {
      const nextVid =
        Math.max(
          pid * 100,
          ...state.products.flatMap(p => (p.variants || []).map(v => v.id))
        ) + 1
      const v: ProductVariant = {
        id: nextVid,
        productId: pid,
        size: payload.size || 'M',
        color: payload.color || 'Obsidian',
        stock: Number(payload.stock ?? 5),
        priceOverride: payload.priceOverride ? Number(payload.priceOverride) : undefined,
        sku: payload.sku || `ENG-${pid}-${nextVid}`,
      }
      prod.variants = [...(prod.variants || []), v]
      prod.stock = prod.variants.reduce((s, item) => s + Number(item.stock), 0)
      if (v.size && !(prod.sizes || []).includes(v.size)) {
        prod.sizes = [...(prod.sizes || []), v.size]
      }
      if (v.color && !(prod.colors || []).includes(v.color)) {
        prod.colors = [...(prod.colors || []), v.color]
      }
      saveState(state)
      return v as T
    }
  }

  const variantItemMatch = pathname.match(/^\/products\/(\d+)\/variants\/(\d+)$/)
  if (variantItemMatch) {
    const pid = Number(variantItemMatch[1])
    const vid = Number(variantItemMatch[2])
    const prod = state.products.find(p => p.id === pid)
    if (!prod) throw new Error('Product not found')
    const idx = (prod.variants || []).findIndex(v => v.id === vid)
    if (idx < 0) throw new Error('Variant not found')
    if (method === 'PUT' || method === 'PATCH') {
      prod.variants![idx] = {
        ...prod.variants![idx],
        ...payload,
        stock: payload.stock !== undefined ? Number(payload.stock) : prod.variants![idx].stock,
      }
      prod.stock = prod.variants!.reduce((s, item) => s + Number(item.stock), 0)
      saveState(state)
      return prod.variants![idx] as T
    }
    if (method === 'DELETE') {
      prod.variants!.splice(idx, 1)
      prod.stock = prod.variants!.reduce((s, item) => s + Number(item.stock), 0)
      saveState(state)
      return { message: 'Variant removed' } as T
    }
  }

  const prodMatch = pathname.match(/^\/products\/(\d+)$/)
  if (prodMatch) {
    const pid = Number(prodMatch[1])
    const idx = state.products.findIndex(p => p.id === pid)
    if (idx < 0) throw new Error('Grail piece not found in archive.')
    if (method === 'GET') {
      return state.products[idx] as T
    }
    if (method === 'PUT' || method === 'PATCH') {
      state.products[idx] = {
        ...state.products[idx],
        ...payload,
        price: payload.price !== undefined ? Number(payload.price) : state.products[idx].price,
        stock: payload.stock !== undefined ? Number(payload.stock) : state.products[idx].stock,
        updatedAt: new Date().toISOString(),
      }
      saveState(state)
      return state.products[idx] as T
    }
    if (method === 'DELETE') {
      state.products.splice(idx, 1)
      saveState(state)
      return { message: 'Product removed from archive' } as T
    }
  }

  // ── CART ───────────────────────────────────────────────────────
  const owner = cartOwnerKey(user)
  if (!state.cartsByOwner[owner]) state.cartsByOwner[owner] = []

  if (method === 'GET' && pathname === '/cart') {
    const items = state.cartsByOwner[owner]
    return {
      items,
      total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    } as T
  }

  if (method === 'POST' && pathname === '/cart') {
    const list = state.cartsByOwner[owner]
    const existing = list.find(
      i =>
        i.productId === Number(payload.productId) &&
        (i.size || '') === (payload.size || '') &&
        (i.color || '') === (payload.color || '')
    )
    const prod = state.products.find(p => p.id === Number(payload.productId))
    if (existing) {
      existing.quantity += Number(payload.quantity || 1)
    } else {
      list.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        productId: Number(payload.productId),
        variantId: payload.variantId ? Number(payload.variantId) : undefined,
        name: String(payload.name || prod?.name || 'ENIGMA Allocation'),
        price: Number(payload.price ?? prod?.price ?? 0),
        quantity: Number(payload.quantity || 1),
        size: payload.size,
        color: payload.color,
        imageUrl: payload.imageUrl || prod?.imageUrl || '/images/enigma/mystery-chest.jpg',
      })
    }
    saveState(state)
    return { items: list } as T
  }

  const cartItemMatch = pathname.match(/^\/cart\/(\d+)$/)
  if (cartItemMatch) {
    const cid = Number(cartItemMatch[1])
    const list = state.cartsByOwner[owner]
    const idx = list.findIndex(i => i.id === cid)
    if (method === 'PUT' || method === 'PATCH') {
      if (idx >= 0) {
        const qty = Number(payload.quantity || 1)
        if (qty <= 0) list.splice(idx, 1)
        else list[idx].quantity = qty
        saveState(state)
      }
      return { items: list } as T
    }
    if (method === 'DELETE') {
      if (idx >= 0) list.splice(idx, 1)
      saveState(state)
      return { items: list } as T
    }
  }

  if (method === 'DELETE' && pathname === '/cart') {
    state.cartsByOwner[owner] = []
    saveState(state)
    return { items: [] } as T
  }

  // ── ORDERS ─────────────────────────────────────────────────────
  if (method === 'POST' && pathname === '/orders') {
    const cartItems =
      Array.isArray(payload.items) && payload.items.length > 0
        ? payload.items
        : state.cartsByOwner[owner]
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Your Vault Bag is empty.')
    }

    const subtotal = cartItems.reduce(
      (s: number, i: any) => s + Number(i.price) * Number(i.quantity),
      0
    )
    let discountAmount = 0
    let appliedCode: string | null = null
    if (payload.voucherCode) {
      const v = evaluateVoucher(state, String(payload.voucherCode), subtotal)
      discountAmount = v.discountAmount
      appliedCode = v.code
      const vRecord = state.vouchers.find(item => item.code === v.code)
      if (vRecord) vRecord.usedCount += 1
    }

    const shippingFee = Number(payload.shippingFee || 0)
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee)

    // Decrement product/variant stock cleanly
    for (const item of cartItems) {
      const prod = state.products.find(p => p.id === Number(item.productId))
      if (prod) {
        prod.stock = Math.max(0, prod.stock - Number(item.quantity || 1))
        if (item.variantId && prod.variants) {
          const v = prod.variants.find(vr => vr.id === Number(item.variantId))
          if (v) v.stock = Math.max(0, v.stock - Number(item.quantity || 1))
        }
      }
    }

    const nextId = Math.max(1000, ...state.orders.map(o => o.id)) + 1
    const paymentMethod = String(payload.paymentMethod || 'cod')
    const newOrder: Order = {
      id: nextId,
      userId: user?.id || 2,
      items: clone(cartItems),
      total: finalTotal,
      voucherCode: appliedCode,
      discountAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
      shippingName: payload.shippingName || user?.name || 'Collector',
      shippingPhone: payload.shippingPhone || user?.phone || '',
      shippingAddress: payload.shippingAddress || user?.address || '',
      note: payload.note || '',
      createdAt: new Date().toISOString(),
    }

    state.orders.unshift(newOrder)
    state.cartsByOwner[owner] = []
    saveState(state)

    return {
      order: newOrder,
      id: newOrder.id,
      paymentUrl: paymentMethod === 'vnpay' ? `/orders/${newOrder.id}?vnpay=simulated_paid` : null,
    } as T
  }

  if (method === 'GET' && (pathname === '/orders/my' || pathname === '/orders/me')) {
    const uid = user?.id
    const list = uid ? state.orders.filter(o => o.userId === uid) : state.orders
    return list as T
  }

  if (method === 'GET' && pathname === '/orders') {
    const status = params.get('status')
    let list = [...state.orders]
    if (status) list = list.filter(o => o.status === status)
    return list as T
  }

  const orderCancelMatch = pathname.match(/^\/orders\/(\d+)\/cancel$/)
  if (orderCancelMatch && (method === 'DELETE' || method === 'PATCH' || method === 'POST')) {
    const oid = Number(orderCancelMatch[1])
    const order = state.orders.find(o => o.id === oid)
    if (!order) throw new Error('Order not found')
    order.status = 'cancelled'
    saveState(state)
    return order as T
  }

  const orderStatusMatch = pathname.match(/^\/orders\/(\d+)\/status$/)
  if (orderStatusMatch && (method === 'PATCH' || method === 'PUT')) {
    const oid = Number(orderStatusMatch[1])
    const order = state.orders.find(o => o.id === oid)
    if (!order) throw new Error('Order not found')
    order.status = payload.status as OrderStatus
    if (order.status === 'delivered') order.paymentStatus = 'paid'
    saveState(state)
    return order as T
  }

  const orderIdMatch = pathname.match(/^\/orders\/(\d+)$/)
  if (orderIdMatch) {
    const oid = Number(orderIdMatch[1])
    const idx = state.orders.findIndex(o => o.id === oid)
    if (idx < 0) throw new Error('Order not found')
    if (method === 'GET') return state.orders[idx] as T
    if (method === 'DELETE') {
      state.orders.splice(idx, 1)
      saveState(state)
      return { message: 'Order deleted' } as T
    }
  }

  // ── LIVE GRAIL AUCTIONS ────────────────────────────────────────
  if (method === 'GET' && pathname === '/auctions') {
    const status = params.get('status')
    let lots = state.auctions.map(hydrateLot)
    if (status) lots = lots.filter(l => l.status === status)
    return lots as T
  }

  if (method === 'POST' && pathname === '/auctions') {
    const nextId = Math.max(0, ...state.auctions.map(a => a.id)) + 1
    const startingBid = Number(payload.startingBid || 5000000)
    const minIncrement = Number(payload.minIncrement || 250000)
    const durationMinutes = Number(payload.durationMinutes || 90)
    const endsAt = payload.endsAt
      ? new Date(payload.endsAt).toISOString()
      : new Date(Date.now() + durationMinutes * 60_000).toISOString()
    const created: AuctionLot = hydrateLot({
      id: nextId,
      productId: payload.productId ? Number(payload.productId) : null,
      title: String(payload.title || `LOT 0${nextId} · Atelier Prototype`),
      subtitle: payload.subtitle || 'Authenticated 1-of-1 Vault Lot',
      imageUrl: payload.imageUrl || '/images/enigma/grail-leather-bomber.jpg',
      startingBid,
      currentBid: startingBid,
      minIncrement,
      nextMinimumBid: startingBid,
      reservePrice: payload.reservePrice ? Number(payload.reservePrice) : null,
      reserveMet: true,
      bidCount: 0,
      endsAt,
      remainingSeconds: durationMinutes * 60,
      status: 'live',
      winnerUserId: null,
      antiSnipeCount: 0,
      bids: [],
    })
    state.auctions.unshift(created)
    saveState(state)
    return created as T
  }

  const auctionBidMatch = pathname.match(/^\/auctions\/(\d+)\/bids$/)
  if (auctionBidMatch && method === 'POST') {
    const aid = Number(auctionBidMatch[1])
    const lot = state.auctions.find(a => a.id === aid)
    if (!lot) throw new Error('Auction lot not found.')
    const hydrated = hydrateLot(lot)
    if (hydrated.status !== 'live' || hydrated.remainingSeconds <= 0) {
      throw new Error('This Grail Lot has already closed.')
    }

    const amount = Number(payload.amount || 0)
    if (amount < hydrated.nextMinimumBid) {
      throw new Error(
        `Minimum valid bid is ${hydrated.nextMinimumBid.toLocaleString('vi-VN')}₫.`
      )
    }

    // Anti-Snipe Rule: < 60s remaining -> +120s automatic extension
    let triggeredExtension = false
    if (hydrated.remainingSeconds < 60) {
      const currentEnd = new Date(lot.endsAt).getTime()
      lot.endsAt = new Date(currentEnd + 120_000).toISOString()
      lot.antiSnipeCount = (lot.antiSnipeCount || 0) + 1
      triggeredExtension = true
    }

    const alias =
      payload.bidderAlias ||
      (user
        ? `${user.name.split(' ')[0].toUpperCase()}_${String(user.id).padStart(2, '0')}`
        : 'INITIATE_88')

    const newBid = {
      id: Date.now(),
      auctionId: aid,
      userId: user?.id || null,
      bidderAlias: String(alias),
      amount,
      triggeredExtension,
      createdAt: new Date().toISOString(),
    }

    lot.currentBid = amount
    lot.bidCount += 1
    lot.winnerUserId = user?.id || null
    lot.bids = [newBid, ...(lot.bids || [])]
    saveState(state)
    return {
      lot: hydrateLot(lot),
      bid: newBid,
      extended: triggeredExtension,
    } as T
  }

  const auctionExtendMatch = pathname.match(/^\/auctions\/(\d+)\/extend$/)
  if (auctionExtendMatch && method === 'PATCH') {
    const aid = Number(auctionExtendMatch[1])
    const lot = state.auctions.find(a => a.id === aid)
    if (!lot) throw new Error('Auction lot not found')
    const seconds = Number(payload.seconds || 120)
    const base = Math.max(Date.now(), new Date(lot.endsAt).getTime())
    lot.endsAt = new Date(base + seconds * 1000).toISOString()
    lot.status = 'live'
    saveState(state)
    return hydrateLot(lot) as T
  }

  const auctionSettleMatch = pathname.match(/^\/auctions\/(\d+)\/settle$/)
  if (auctionSettleMatch && method === 'PATCH') {
    const aid = Number(auctionSettleMatch[1])
    const lot = state.auctions.find(a => a.id === aid)
    if (!lot) throw new Error('Auction lot not found')
    lot.status = 'settled'
    saveState(state)
    return hydrateLot(lot) as T
  }

  const auctionIdMatch = pathname.match(/^\/auctions\/(\d+)$/)
  if (auctionIdMatch) {
    const aid = Number(auctionIdMatch[1])
    const idx = state.auctions.findIndex(a => a.id === aid)
    if (idx < 0) throw new Error('Auction lot not found')
    if (method === 'GET') return hydrateLot(state.auctions[idx]) as T
    if (method === 'PUT' || method === 'PATCH') {
      state.auctions[idx] = { ...state.auctions[idx], ...payload }
      saveState(state)
      return hydrateLot(state.auctions[idx]) as T
    }
    if (method === 'DELETE') {
      state.auctions.splice(idx, 1)
      saveState(state)
      return { message: 'Lot deleted' } as T
    }
  }

  // ── MYSTERY BOXES & 8-STEP STYLE CODEX ─────────────────────────
  if (method === 'GET' && pathname === '/mystery-boxes') {
    return state.mysteryBoxes.filter(b => b.isActive !== false) as T
  }
  if (method === 'GET' && pathname === '/mystery-boxes/quiz-questions') {
    return DEMO_QUIZ_STEPS as T
  }
  if (method === 'POST' && pathname === '/mystery-boxes/decode-style') {
    return scoreQuizAnswers(state, payload, user) as T
  }
  if (method === 'GET' && pathname === '/mystery-boxes/my-codex') {
    const found = user
      ? state.styleProfiles.find(p => p.userId === user.id)
      : state.styleProfiles[0]
    return (found?.codex || null) as T
  }
  if (method === 'GET' && pathname === '/mystery-boxes/profiles') {
    return state.styleProfiles as T
  }
  if (method === 'POST' && pathname === '/mystery-boxes') {
    const nextId = Math.max(0, ...state.mysteryBoxes.map(b => b.id)) + 1
    const created: MysteryBoxTier = {
      id: nextId,
      tierSlug: payload.tierSlug || `vault-tier-${nextId}`,
      name: String(payload.name || 'Custom Vault Chest'),
      subtitle: payload.subtitle || '',
      description: payload.description || '',
      price: Number(payload.price || 5900000),
      guaranteedMinValue: Number(payload.guaranteedMinValue || 8500000),
      itemCount: Number(payload.itemCount || 3),
      imageUrl: payload.imageUrl || '/images/enigma/mystery-chest.jpg',
      archetypeMatch: payload.archetypeMatch || ['SHADOW_ARCHIVE'],
      possibleDrops: payload.possibleDrops || [],
      isActive: true,
    }
    state.mysteryBoxes.push(created)
    saveState(state)
    return created as T
  }

  // ── CONCIERGE ("FIND IT AT MY PRICE") ──────────────────────────
  if (method === 'POST' && pathname === '/concierge') {
    const targetPrice = Number(payload.targetPrice || 0)
    if (!payload.itemName || targetPrice <= 0) {
      throw new Error('Item name and valid target price are required.')
    }
    const ticket: ConciergeTicket = {
      id: Math.max(0, ...state.concierge.map(c => c.id)) + 1,
      userId: user?.id || null,
      requesterName: String(payload.requesterName || user?.name || 'Inner Circle Guest'),
      requesterEmail: String(payload.requesterEmail || user?.email || 'collector@enigma.cult'),
      itemName: String(payload.itemName),
      brand: payload.brand || null,
      size: String(payload.size || 'One Size'),
      targetPrice,
      marketEstimate: Math.round(targetPrice * 1.14),
      referenceImageUrl: payload.referenceImageUrl || null,
      notes: payload.notes || null,
      status: 'pending',
      counterOfferPrice: null,
      adminNotes: null,
      createdAt: new Date().toISOString(),
    }
    state.concierge.unshift(ticket)
    saveState(state)
    return ticket as T
  }

  if (method === 'GET' && pathname === '/concierge/my') {
    const list = user
      ? state.concierge.filter(c => c.userId === user.id || c.requesterEmail === user.email)
      : state.concierge
    return list as T
  }

  if (method === 'GET' && pathname === '/concierge') {
    return state.concierge as T
  }

  const conciergeReviewMatch = pathname.match(/^\/concierge\/(\d+)\/review$/)
  if (conciergeReviewMatch && (method === 'PATCH' || method === 'PUT')) {
    const cid = Number(conciergeReviewMatch[1])
    const ticket = state.concierge.find(c => c.id === cid)
    if (!ticket) throw new Error('Concierge ticket not found')
    ticket.status = (payload.status as ConciergeStatus) || ticket.status
    if (payload.counterOfferPrice !== undefined) {
      ticket.counterOfferPrice = payload.counterOfferPrice
        ? Number(payload.counterOfferPrice)
        : null
    }
    if (payload.adminNotes !== undefined) {
      ticket.adminNotes = payload.adminNotes
    }
    saveState(state)
    return ticket as T
  }

  // ── VOUCHERS / COUPONS ─────────────────────────────────────────
  if (method === 'POST' && pathname === '/vouchers/validate') {
    return evaluateVoucher(
      state,
      String(payload.code || ''),
      Number(payload.orderAmount || 0)
    ) as T
  }

  if (method === 'GET' && pathname === '/vouchers/public') {
    return state.vouchers.filter(v => v.isActive && !v.isSecretInitiation) as T
  }

  if (method === 'GET' && pathname === '/vouchers') {
    return state.vouchers as T
  }

  if (method === 'POST' && pathname === '/vouchers') {
    const created: VoucherItem = {
      id: Math.max(0, ...state.vouchers.map(v => v.id)) + 1,
      code: String(payload.code || '').trim().toUpperCase(),
      description: String(payload.description || 'ENIGMA Privilege'),
      discountType: payload.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(payload.discountValue || 10),
      minOrderAmount: Number(payload.minOrderAmount || 0),
      maxDiscountAmount: payload.maxDiscountAmount ? Number(payload.maxDiscountAmount) : null,
      usageLimit: Number(payload.usageLimit || 200),
      usedCount: 0,
      isSecretInitiation: Boolean(payload.isSecretInitiation),
      expiresAt: payload.expiresAt || null,
      isActive: payload.isActive !== false,
    }
    state.vouchers.unshift(created)
    saveState(state)
    return created as T
  }

  const voucherIdMatch = pathname.match(/^\/vouchers\/(\d+)$/)
  if (voucherIdMatch) {
    const vid = Number(voucherIdMatch[1])
    const idx = state.vouchers.findIndex(v => v.id === vid)
    if (idx < 0) throw new Error('Voucher not found')
    if (method === 'PUT' || method === 'PATCH') {
      state.vouchers[idx] = { ...state.vouchers[idx], ...payload }
      saveState(state)
      return state.vouchers[idx] as T
    }
    if (method === 'DELETE') {
      state.vouchers.splice(idx, 1)
      saveState(state)
      return { message: 'Voucher deleted' } as T
    }
  }

  // ── DASHBOARD & ANALYTICS ──────────────────────────────────────
  if (method === 'GET' && (pathname === '/dashboard/executive' || pathname === '/dashboard/stats')) {
    return buildExecutiveDashboard(state) as T
  }

  if (method === 'GET' && pathname === '/dashboard/revenue') {
    const exec = buildExecutiveDashboard(state)
    return exec.gmvTimeSeries.map(pt => ({
      month: pt.date,
      revenue: pt.gmv,
      orders: pt.orders,
    })) as T
  }

  if (method === 'GET' && pathname === '/dashboard/latest-orders') {
    return state.orders.slice(0, 8) as T
  }

  // ── AI STYLIST (HYBRID BM25 + GENERATIVE UI) ───────────────────
  if (method === 'POST' && pathname === '/ai-chat/message') {
    return handleAiStylistMessage(state, payload, user) as T
  }

  if (method === 'GET' && pathname.startsWith('/ai-chat/history')) {
    return [] as T
  }

  throw new Error(`Unhandled Vault route: ${method} ${pathname}`)
}
