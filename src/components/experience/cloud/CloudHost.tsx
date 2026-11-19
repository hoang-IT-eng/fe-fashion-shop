import { useEffect, useRef, useState } from 'react'
import {
  cloudsSupported,
  isModeLive,
  armCloudWorld,
  registerCloudHost,
  subscribeLive,
  type CloudMode,
} from './cloudState'

interface CloudHostProps {
  mode: Exclude<CloudMode, 'overlay'>
  className?: string
  /** 'idle' waits for browser idle after load (hero); 'near' loads when the host nears the viewport. */
  load?: 'idle' | 'near'
}

/** A slot the shared cloud canvas can occupy. Renders nothing visible on its own.
 *  'idle' arms the world immediately (first interaction loads it); 'near' arms it when the slot nears the viewport. */
export function CloudHost({ mode, className = '', load = 'near' }: CloudHostProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !cloudsSupported()) return
    const unregister = registerCloudHost(el, mode)
    let io: IntersectionObserver | null = null
    if (load === 'idle') {
      armCloudWorld()
    } else {
      io = new IntersectionObserver(
        entries => {
          if (entries.some(e => e.isIntersecting)) {
            armCloudWorld()
            io?.disconnect()
          }
        },
        { rootMargin: '600px 0px' }
      )
      io.observe(el)
    }
    return () => {
      io?.disconnect()
      unregister()
    }
  }, [mode, load])
  return <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />
}

/** True while the live canvas is rendering in a host of this mode. */
export function useCloudLive(mode: CloudMode): boolean {
  const [live, setLive] = useState(() => isModeLive(mode))
  useEffect(() => {
    setLive(isModeLive(mode))
    return subscribeLive(() => setLive(isModeLive(mode)))
  }, [mode])
  return live
}
