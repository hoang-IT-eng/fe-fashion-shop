import { useEffect, useState } from 'react'
import { api } from '../api/apiClient'
import type { Product } from '../types/product'
import { DescentHero } from '../components/home/DescentHero'
import { LazyChapters } from '../components/home/LazyChapters'

/**
 * Home: the Descent hero (first paint) + the chapters below it, which are
 * code-split and rendered on approach.
 */
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])

  /* Hero intro waits for the first-visit loader to leave (it removes #nocturne-loader). */
  const [introReady, setIntroReady] = useState(false)
  useEffect(() => {
    if (typeof document === 'undefined' || !document.getElementById('nocturne-loader')) {
      setIntroReady(true)
      return
    }
    const observer = new MutationObserver(() => {
      if (!document.getElementById('nocturne-loader')) {
        setIntroReady(true)
        observer.disconnect()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const cap = window.setTimeout(() => setIntroReady(true), 2000)
    return () => {
      observer.disconnect()
      window.clearTimeout(cap)
    }
  }, [])

  useEffect(() => {
    let alive = true
    void api
      .get<{ data: Product[] }>('/products?limit=8')
      .then(res => alive && setProducts(Array.isArray(res?.data) ? res.data : []))
      .catch(() => alive && setProducts([]))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="bg-ink text-bone">
      <DescentHero products={products} introReady={introReady} />
      <LazyChapters products={products} />
    </div>
  )
}
