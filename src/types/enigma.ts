export interface AuctionBid {
  id: number
  auctionId: number
  userId?: number | null
  bidderAlias: string
  amount: number
  triggeredExtension: boolean
  createdAt: string
}

export interface AuctionLot {
  id: number
  productId?: number | null
  title: string
  subtitle?: string | null
  imageUrl?: string | null
  startingBid: number
  currentBid: number
  minIncrement: number
  nextMinimumBid: number
  reservePrice: number | null
  reserveMet: boolean
  bidCount: number
  endsAt: string
  remainingSeconds: number
  status: 'scheduled' | 'live' | 'settled' | 'cancelled'
  winnerUserId?: number | null
  antiSnipeCount: number
  bids: AuctionBid[]
}

export interface MysteryBoxTier {
  id: number
  tierSlug: string
  name: string
  subtitle?: string | null
  description?: string | null
  price: number
  guaranteedMinValue: number
  itemCount: number
  imageUrl?: string | null
  archetypeMatch?: string[] | null
  possibleDrops?: { title: string; rarity: string; odds: string }[] | null
  isActive: boolean
}

export interface QuizOption {
  value: string
  label: string
  archetype: string
}

export interface QuizStep {
  step: number
  field: string
  question: string
  options: QuizOption[]
}

export interface TasteCodexResult {
  archetypeCode: string
  archetype: string
  motto: string
  description: string
  paletteNotes: string[]
  categories: string[]
  keywords: string[]
  dnaBreakdown: {
    code: string
    archetype: string
    affinityPercent: number
  }[]
  matchedTierSlug: string
  recommendedBox: MysteryBoxTier | null
  persisted?: boolean
}

export type ConciergeStatus =
  | 'pending'
  | 'reviewing'
  | 'countered'
  | 'accepted'
  | 'sourced'
  | 'declined'

export interface ConciergeTicket {
  id: number
  userId?: number | null
  requesterName: string
  requesterEmail: string
  itemName: string
  brand?: string | null
  size: string
  targetPrice: number
  marketEstimate?: number | null
  referenceImageUrl?: string | null
  notes?: string | null
  status: ConciergeStatus
  counterOfferPrice?: number | null
  adminNotes?: string | null
  createdAt: string
}

export interface VoucherItem {
  id: number
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount?: number | null
  usageLimit: number
  usedCount: number
  isSecretInitiation: boolean
  expiresAt?: string | null
  isActive: boolean
}

export interface VoucherValidation {
  valid: boolean
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  discountAmount: number
  finalTotal: number
  isSecretInitiation: boolean
  message: string
}

export interface ReviewItem {
  id: number
  userId: number
  userName?: string
  productId: number
  rating: number
  comment: string
  verifiedBuyer?: boolean
  createdAt: string
}

export type GenerativeUiBlock =
  | {
      kind: 'product_cards'
      title: string
      products: {
        id: number
        name: string
        brand?: string | null
        category?: string | null
        releaseType?: string | null
        condition?: string | null
        price: number
        stock: number
        imageUrl?: string | null
        sizes: string[]
        colors: string[]
        variants?: {
          id: number
          size: string | null
          color: string | null
          stock: number
          sku: string | null
        }[]
      }[]
    }
  | {
      kind: 'comparison_table'
      title: string
      columns: {
        id: number
        name: string
        brand: string
        category: string
        price: number
        releaseType: string
        condition: string
        sizes: string
        colors: string
        stock: number
        imageUrl?: string | null
      }[]
      verdict: string
    }
  | {
      kind: 'auction_card'
      title: string
      lots: {
        id: number
        title: string
        subtitle?: string | null
        imageUrl?: string | null
        currentBid: number
        nextMinimumBid: number
        bidCount: number
        endsAt: string
        remainingSeconds: number
        reserveMet: boolean
      }[]
    }
  | {
      kind: 'order_stepper'
      title: string
      order: {
        id: number
        status: string
        paymentMethod: string
        paymentStatus: string
        total: number
        createdAt: string
        itemCount: number
        currentStageIndex: number
        stages: { key: string; label: string; completed: boolean }[]
      }
    }
  | {
      kind: 'taste_codex_prompt'
      title: string
      subtitle: string
      currentArchetype?: string | null
      suggestedTierSlug: string
      ctaUrl: string
    }

export interface AiChatResponsePayload {
  type: 'text' | 'product_recommendations' | 'generative_ui'
  sessionId: string
  message: string
  engine?: 'gemini-tools' | 'hybrid-local-rag' | 'gemini-2.5-flash'
  toolsInvoked?: string[]
  uiBlocks?: GenerativeUiBlock[]
}

export interface ExecutiveDashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingOrders: number
  newOrdersToday: number
  ordersByStatus: {
    pending: number
    confirmed: number
    shipping: number
    delivered: number
    cancelled: number
  }
  conversionBreakdown: {
    fulfillmentRate: number
    activePipelineRate: number
    cancellationRate: number
  }
  gmvTimeSeries: {
    date: string
    gmv: number
    orders: number
  }[]
  categoryVelocity: {
    category: string
    units: number
    revenue: number
  }[]
  sizeVelocity: {
    size: string
    units: number
  }[]
  colorVelocity: {
    color: string
    units: number
  }[]
  auctionHeat: {
    liveCount: number
    totalLots: number
    totalBids: number
    highestActiveBid: number
    activeAuctionValue: number
    hotLots: {
      id: number
      title: string
      currentBid: number
      bidCount: number
      endsAt: string
    }[]
  }
  lowStockSkus: {
    variantId: number
    productId: number
    productName: string
    sku: string
    size: string | null
    color: string | null
    stock: number
  }[]
  pendingConciergeCount: number
  recentConciergeRequests: {
    id: number
    requesterName: string
    itemName: string
    size: string
    targetPrice: number
    status: string
    createdAt: string
  }[]
  codexDistribution: {
    archetype: string
    count: number
  }[]
}
