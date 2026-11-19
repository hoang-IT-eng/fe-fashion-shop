/**
 * Live auction feed over the backend's Socket.IO gateway (namespace
 * `/auctions`, events `auction:bid_placed` / `auction:extended`).
 * socket.io-client is imported on demand, only when a live API is
 * configured and a component actually subscribes.
 */
export interface BidPlacedEvent {
  auctionId: number
  currentBid: number
  bidCount: number
  endsAt: string
  reserveMet: boolean
  bid: {
    id: number
    bidderAlias: string
    amount: number
    createdAt: string
    triggeredExtension: boolean
  }
}

export interface ExtendedEvent {
  auctionId: number
  endsAt: string
  extendedBySeconds: number
  antiSnipeCount: number
}

export type FeedStatus = 'offline' | 'connecting' | 'live'

export interface AuctionFeedHandlers {
  onBid?: (e: BidPlacedEvent) => void
  onExtended?: (e: ExtendedEvent) => void
  onStatus?: (s: FeedStatus) => void
}

const API = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '')

export function subscribeAuctionFeed(handlers: AuctionFeedHandlers, lotIds: number[] = []): () => void {
  if (!API || typeof window === 'undefined' || import.meta.env.MODE === 'test') {
    handlers.onStatus?.('offline')
    return () => {}
  }
  let closed = false
  let socket: { disconnect: () => void } | null = null
  handlers.onStatus?.('connecting')
  void import('socket.io-client')
    .then(({ io }) => {
      if (closed) return
      const s = io(`${API}/auctions`, { transports: ['websocket'], reconnectionAttempts: 6 })
      socket = s
      s.on('connect', () => {
        handlers.onStatus?.('live')
        lotIds.forEach(id => s.emit('auction:join', { auctionId: id }))
      })
      s.on('disconnect', () => handlers.onStatus?.('connecting'))
      s.on('connect_error', () => handlers.onStatus?.('offline'))
      // the gateway emits globally *and* to the lot room, so de-duplicate by bid id
      const seen = new Set<number>()
      s.on('auction:bid_placed', (e: BidPlacedEvent) => {
        if (seen.has(e.bid.id)) return
        seen.add(e.bid.id)
        handlers.onBid?.(e)
      })
      let lastExt = ''
      s.on('auction:extended', (e: ExtendedEvent) => {
        const key = `${e.auctionId}:${e.endsAt}`
        if (key === lastExt) return
        lastExt = key
        handlers.onExtended?.(e)
      })
    })
    .catch(() => handlers.onStatus?.('offline'))
  return () => {
    closed = true
    socket?.disconnect()
  }
}
