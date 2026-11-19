import { useEffect, useRef, useState } from 'react'
import { hasFinePointer, motionDisabled } from '../../lib/motion'

/**
 * Awwwards-style custom cursor: a small dot that tracks the pointer
 * instantly plus a trailing ring that lerps behind it. The ring grows
 * over interactive elements and becomes a labelled disc ("VIEW") over
 * elements carrying `data-cursor="view"` (product cards).
 *
 * Safety contract:
 * - Only mounts on (pointer: fine) devices with motion enabled.
 * - The native cursor is hidden (via the `has-custom-cursor` class on
 *   <html>) only AFTER this component has mounted successfully, so a JS
 *   failure can never strand the user without a cursor.
 * - Form fields keep their native text cursor (see index.css).
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (motionDisabled() || !hasFinePointer()) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring) return

    document.documentElement.classList.add('has-custom-cursor')

    const pos = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    let hovering = false
    let labelText = ''
    let pressed = false
    let visible = false
    let rafId = 0

    const applyRing = () => {
      const scale = (labelText ? 2.15 : hovering ? 1.7 : 1) * (pressed ? 0.88 : 1)
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`
      ring.style.backgroundColor = labelText ? 'rgba(239, 233, 223, 0.96)' : 'transparent'
      ring.style.mixBlendMode = labelText ? 'normal' : 'difference'
      if (label) {
        label.style.opacity = labelText ? '1' : '0'
        if (labelText && label.textContent !== labelText) label.textContent = labelText
      }
    }

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      applyRing()
      rafId = window.requestAnimationFrame(loop)
    }
    rafId = window.requestAnimationFrame(loop)

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible) {
        visible = true
        ringPos.x = pos.x
        ringPos.y = pos.y
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target || typeof target.closest !== 'function') return
      const labelled = target.closest<HTMLElement>('[data-cursor]')
      labelText = labelled?.dataset.cursor
        ? labelled.dataset.cursor.toUpperCase()
        : ''
      hovering = Boolean(
        target.closest('a, button, [role="button"], input, select, textarea, label')
      )
    }

    const onDown = () => {
      pressed = true
    }
    const onUp = () => {
      pressed = false
    }
    const onLeave = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[300] flex h-9 w-9 items-center justify-center rounded-full border border-bone opacity-0 transition-opacity duration-300"
        style={{ mixBlendMode: 'difference' }}
      >
        <span
          ref={labelRef}
          className="font-sans text-[9px] font-semibold uppercase tracking-[0.22em] text-ink opacity-0 transition-opacity duration-200"
        />
      </div>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[301] h-1.5 w-1.5 rounded-full bg-bone opacity-0 transition-opacity duration-300"
        style={{ mixBlendMode: 'difference' }}
      />
    </>
  )
}
