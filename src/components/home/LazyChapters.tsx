import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { Product } from '../../types/product'
import { motionDisabled } from '../../lib/motion'

const load = () => import('./HomeChapters')
const HomeChapters = lazy(load)

/**
 * Renders the below-the-descent chapters on approach: the chunk is fetched
 * when the browser is idle and mounted once the visitor scrolls within
 * ~1.5 screens of it (or immediately for tests / reduced motion / no IO).
 * The placeholder reserves height so the footer never jumps into view.
 */
export function LazyChapters({ products }: { products: Product[] }) {
  const sentinel = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(
    () => typeof IntersectionObserver === 'undefined' || import.meta.env.MODE === 'test'
  )

  useEffect(() => {
    if (show) return
    const el = sentinel.current
    if (!el) return
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    const idle = w.requestIdleCallback ? w.requestIdleCallback(() => void load(), { timeout: 4000 }) : 0
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: motionDisabled() ? '100% 0px' : '150% 0px' }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (idle) (window as any).cancelIdleCallback?.(idle)
    }
  }, [show])

  if (!show) return <div ref={sentinel} aria-hidden="true" className="h-[400vh]" />
  return (
    <Suspense fallback={<div aria-hidden="true" className="h-[400vh]" />}>
      <HomeChapters products={products} />
    </Suspense>
  )
}
