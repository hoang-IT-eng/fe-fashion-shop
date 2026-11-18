import React, { useEffect, useState } from 'react'
import { Download, AlertTriangle, Flame, TrendingUp, Layers } from 'lucide-react'
import { api } from '../../api/apiClient'
import { ExecutiveDashboardStats } from '../../types/enigma'
import { formatVnd } from '../../lib/format'
import { useToast } from '../../components/Toast'

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState<ExecutiveDashboardStats | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  useEffect(() => {
    void api.get<ExecutiveDashboardStats>('/dashboard/executive').then(setStats)
  }, [])

  const handleExportCsv = () => {
    if (!stats) return
    const rows = [
      ['Date', 'GMV_VND', 'Orders'],
      ...stats.gmvTimeSeries.map(pt => [pt.date, String(Math.round(pt.gmv)), String(pt.orders)]),
      [],
      ['Category', 'Units_Sold', 'Revenue_VND'],
      ...stats.categoryVelocity.map(c => [c.category, String(c.units), String(Math.round(c.revenue))]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `enigma-executive-gmv-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast('Exported Executive GMV & Velocity CSV.', 'success')
  }

  if (!stats) {
    return (
      <div className="py-16 font-mono text-xs tracking-[0.26em] text-[#a3a3a3] uppercase">
        AGGREGATING VAULT TELEMETRY...
      </div>
    )
  }

  // Build SVG Area Chart coordinates
  const series = stats.gmvTimeSeries
  const maxGmv = Math.max(1, ...series.map(d => d.gmv)) * 1.12
  const chartW = 720
  const chartH = 220
  const padX = 24
  const padY = 22

  const points = series.map((pt, i) => {
    const x = padX + (i / Math.max(1, series.length - 1)) * (chartW - padX * 2)
    const y = chartH - padY - (pt.gmv / maxGmv) * (chartH - padY * 2)
    return { x, y, ...pt }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1]?.x.toFixed(1) || 0} ${
    chartH - padY
  } L ${points[0]?.x.toFixed(1) || 0} ${chartH - padY} Z`

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#f9f9f9]">
            EXECUTIVE ANALYTICS · REAL-TIME LEDGER
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-[#f9f9f9]">
            Revenue, Velocity &amp; Vault Risk
          </h2>
        </div>

        <button
          id="admin-export-csv-btn"
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#d9d9d9] transition"
        >
          <Download className="w-3.5 h-3.5" /> Export Telemetry CSV
        </button>
      </div>

      {/* Row 1: SVG Area GMV Chart + Conversion & Order Status Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* SVG Area GMV Chart */}
        <section className="xl:col-span-8 bg-[#111111] border border-[#f9f9f9]/12 p-6 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#a3a3a3]">
                7-DAY GROSS MERCHANDISE VOLUME (GMV)
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-mono text-2xl font-semibold text-[#f9f9f9] tabular-nums">
                  {formatVnd(stats.totalRevenue)}
                </span>
                <span className="font-mono text-xs text-[#f9f9f9] inline-flex items-center gap-1 tabular-nums">
                  <TrendingUp className="w-3.5 h-3.5" /> AOV {formatVnd(stats.averageOrderValue)}
                </span>
              </div>
            </div>
            {hoverIdx !== null && points[hoverIdx] && (
              <div className="px-3 py-1.5 bg-[#0a0a0a] border border-[#f9f9f9]/50 font-mono text-xs tabular-nums">
                <span className="text-[#a3a3a3] mr-2">{points[hoverIdx].date}:</span>
                <span className="text-[#f9f9f9] font-semibold">
                  {formatVnd(points[hoverIdx].gmv)}
                </span>
                <span className="text-[#a3a3a3] ml-2">({points[hoverIdx].orders} orders)</span>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-56 select-none"
              role="img"
              aria-label="7-Day GMV Area Chart"
            >
              <defs>
                <linearGradient id="enigmaGmvFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f9f9f9" stopOpacity="0.36" />
                  <stop offset="100%" stopColor="#f9f9f9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map(r => (
                <line
                  key={r}
                  x1={padX}
                  x2={chartW - padX}
                  y1={chartH - padY - r * (chartH - padY * 2)}
                  y2={chartH - padY - r * (chartH - padY * 2)}
                  stroke="#f9f9f9"
                  strokeOpacity="0.07"
                  strokeDasharray="3 4"
                />
              ))}

              <path d={areaPath} fill="url(#enigmaGmvFill)" />
              <path d={linePath} fill="none" stroke="#f9f9f9" strokeWidth="2.2" />

              {points.map((p, idx) => (
                <g
                  key={p.date}
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoverIdx === idx ? 5.5 : 3.5}
                    fill="#0a0a0a"
                    stroke="#f9f9f9"
                    strokeWidth="2"
                  />
                  <text
                    x={p.x}
                    y={chartH - 4}
                    textAnchor="middle"
                    fill="#a3a3a3"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {p.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Conversion & Order Status Funnel */}
        <section className="xl:col-span-4 bg-[#111111] border border-[#f9f9f9]/12 p-6 space-y-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f9f9f9]">
              FULFILLMENT &amp; CONVERSION FUNNEL
            </span>
            <h3 className="font-display text-xl text-[#f9f9f9] mt-1">Pipeline Telemetry</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            <div className="p-2.5 bg-[#0a0a0a] border border-[#f9f9f9]/10">
              <span className="block text-base font-semibold text-[#f9f9f9] tabular-nums">
                {stats.conversionBreakdown.fulfillmentRate}%
              </span>
              <span className="text-[9px] text-[#a3a3a3] uppercase">Delivered</span>
            </div>
            <div className="p-2.5 bg-[#0a0a0a] border border-[#f9f9f9]/10">
              <span className="block text-base font-semibold text-[#f9f9f9] tabular-nums">
                {stats.conversionBreakdown.activePipelineRate}%
              </span>
              <span className="text-[9px] text-[#a3a3a3] uppercase">In Transit</span>
            </div>
            <div className="p-2.5 bg-[#0a0a0a] border border-[#f9f9f9]/10">
              <span className="block text-base font-semibold text-[#a3a3a3] tabular-nums">
                {stats.conversionBreakdown.cancellationRate}%
              </span>
              <span className="text-[9px] text-[#a3a3a3] uppercase">Cancelled</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Pending Vault Reserve', count: stats.ordersByStatus.pending },
              { label: 'NFC Confirmed', count: stats.ordersByStatus.confirmed },
              { label: 'Armored Transit', count: stats.ordersByStatus.shipping },
              { label: 'Collector Signed', count: stats.ordersByStatus.delivered },
            ].map(row => {
              const pct = stats.totalOrders
                ? Math.max(8, Math.round((row.count / stats.totalOrders) * 100))
                : 15
              return (
                <div key={row.label} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#f9f9f9]/85">{row.label}</span>
                    <span className="text-[#f9f9f9] tabular-nums">{row.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#0a0a0a]">
                    <div className="h-full bg-[#f9f9f9]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Row 2: Top Moving Sizes/Colorways Matrix + Category Velocity + Low-Stock SKU Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Moving Sizes & Colorways Matrix */}
        <section className="lg:col-span-4 bg-[#111111] border border-[#f9f9f9]/12 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#f9f9f9]" />
            <h3 className="font-display text-xl text-[#f9f9f9]">Size &amp; Chromatic Velocity</h3>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-[#a3a3a3] mb-2">
              Fastest Moving Sizes
            </span>
            <div className="grid grid-cols-2 gap-2">
              {stats.sizeVelocity.slice(0, 6).map(sv => (
                <div
                  key={sv.size}
                  className="p-2.5 bg-[#0a0a0a] border border-[#f9f9f9]/10 flex items-center justify-between font-mono text-xs"
                >
                  <span className="text-[#f9f9f9]">Size {sv.size}</span>
                  <span className="text-[#f9f9f9] tabular-nums">{sv.units}u</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-[#a3a3a3] mb-2">
              Dominant Finishes / Colorways
            </span>
            <div className="space-y-1.5">
              {stats.colorVelocity.slice(0, 4).map(cv => (
                <div
                  key={cv.color}
                  className="px-3 py-2 bg-[#0a0a0a] border border-[#f9f9f9]/10 flex items-center justify-between font-mono text-xs"
                >
                  <span className="text-[#f9f9f9] truncate">{cv.color}</span>
                  <span className="text-[#f9f9f9] tabular-nums">{cv.units} units</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Revenue Velocity + Auction Heat */}
        <section className="lg:col-span-4 bg-[#111111] border border-[#f9f9f9]/12 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#f9f9f9]" />
            <h3 className="font-display text-xl text-[#f9f9f9]">Capsule &amp; Auction Heat</h3>
          </div>

          <div className="space-y-2">
            {stats.categoryVelocity.slice(0, 5).map(cat => (
              <div
                key={cat.category}
                className="p-2.5 bg-[#0a0a0a] border border-[#f9f9f9]/10 flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <span className="text-[#f9f9f9]">{cat.category}</span>
                  <span className="text-[#a3a3a3] ml-2">({cat.units}u)</span>
                </div>
                <span className="text-[#f9f9f9] tabular-nums">{formatVnd(cat.revenue)}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-[#0a0a0a] border border-[#f9f9f9]/35 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#a3a3a3]">LIVE AUCTION BOOK</span>
              <span className="text-[#f9f9f9] tabular-nums">
                {stats.auctionHeat.liveCount} LOTS · {stats.auctionHeat.totalBids} BIDS
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a3a3a3]">ACTIVE BID VOLUME</span>
              <span className="text-[#f9f9f9] font-semibold tabular-nums">
                {formatVnd(stats.auctionHeat.activeAuctionValue)}
              </span>
            </div>
          </div>
        </section>

        {/* Low-Stock SKU Alerts */}
        <section className="lg:col-span-4 bg-[#111111] border border-[#f9f9f9]/12 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f9f9f9]" />
              <h3 className="font-display text-xl text-[#f9f9f9]">Low-Stock SKU Alerts</h3>
            </div>
            <span className="font-mono text-xs text-[#f9f9f9] tabular-nums">
              {stats.lowStockSkus.length} SKUS ≤ 3
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {stats.lowStockSkus.map(sku => (
              <div
                key={sku.variantId}
                className="p-3 bg-[#0a0a0a] border border-[#f9f9f9]/10 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[#f9f9f9] truncate">{sku.productName}</p>
                  <p className="font-mono text-[10px] text-[#a3a3a3]">
                    {sku.sku} · {sku.size || 'OS'}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 font-mono text-[10px] tabular-nums border ${
                    sku.stock <= 1
                      ? 'border-red-500/50 text-red-300 bg-red-950/30'
                      : 'border-[#f9f9f9]/50 text-[#f9f9f9]'
                  }`}
                >
                  {sku.stock} LEFT
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
