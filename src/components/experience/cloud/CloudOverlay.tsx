import { useEffect, useRef } from 'react'
import { cloudsSupported, loadCloudWorldWhenIdle, registerCloudHost } from './cloudState'

/**
 * Fixed full-screen slot for the shared cloud canvas when it plays the veil
 * (loader, menu, page transitions). Sits above page chrome (drawer z-100)
 * and below the menu content (z-115), loader text (z-120) and cursor.
 */
export function CloudOverlay() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !cloudsSupported()) return
    const off = registerCloudHost(el, 'overlay')
    // transitions + menu use the world on every page; fetch it once idle
    loadCloudWorldWhenIdle(4000)
    return off
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-cloud-overlay
      className="pointer-events-none fixed inset-0 z-[110]"
      style={{ visibility: 'hidden' }}
    />
  )
}
