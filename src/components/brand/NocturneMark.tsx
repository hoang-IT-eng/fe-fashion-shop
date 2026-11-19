import React, { useId } from 'react'
import { ECLIPSE, WORDMARK_LETTERS, WORDMARK_VIEWBOX } from './wordmarkPath'

/** The eclipse glyph: a bone ring holding an ember crescent. */
function Eclipse({ cx, cy, r, ring = 20, maskId }: { cx: number; cy: number; r: number; ring?: number; maskId: string }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r - ring / 2} fill="none" stroke="currentColor" strokeWidth={ring} />
      <mask id={maskId}>
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="#fff" />
        <circle cx={cx + r * 0.26} cy={cy - r * 0.16} r={r * 0.56} fill="#000" />
      </mask>
      <circle cx={cx} cy={cy} r={r * 0.62} fill="var(--n-ember, #c8864a)" mask={`url(#${maskId})`} />
    </>
  )
}

export function NocturneWordmark({ className = 'h-4 w-auto', title = 'NOCTURNE' }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox={WORDMARK_VIEWBOX} className={className} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d={WORDMARK_LETTERS} />
      <Eclipse cx={ECLIPSE.cx} cy={ECLIPSE.cy} r={ECLIPSE.r} maskId={`nct-wm-${id}`} />
    </svg>
  )
}

interface NocturneMarkProps {
  className?: string
  showWordmark?: boolean
  subtitle?: string
}

/**
 * Brand lockup. Without `showWordmark` it renders the eclipse monogram only
 * (decorative; pair it with visible text or an aria-label on the parent).
 */
export function NocturneMark({ className = 'w-8 h-8', showWordmark = false, subtitle }: NocturneMarkProps) {
  const id = useId().replace(/:/g, '')
  if (showWordmark) {
    return (
      <span className="inline-flex flex-col items-start gap-1.5 select-none text-bone">
        <NocturneWordmark className="h-[13px] md:h-[15px] w-auto" />
        {subtitle && (
          <span className="font-sans text-[9px] font-medium tracking-[0.32em] text-bone-muted uppercase">{subtitle}</span>
        )}
      </span>
    )
  }
  return (
    <svg viewBox="0 0 64 64" className={`${className} text-bone`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <Eclipse cx={32} cy={32} r={28} ring={2.5} maskId={`nct-mk-${id}`} />
    </svg>
  )
}
