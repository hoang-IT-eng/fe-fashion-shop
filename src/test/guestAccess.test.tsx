import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Regression tests for the forced /auth redirect.
 * Before: AppLayout fetched /cart for every visitor, the live API answered 401,
 * and apiClient hard-redirected the whole app to /auth — guests never saw the home page.
 */
type FetchCall = { url: string; method: string }

function stubLiveApi(calls: FetchCall[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = (init?.method || 'GET').toUpperCase()
    calls.push({ url, method })
    const json = (status: number, body: unknown) =>
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    if (url.includes('/cart')) return json(401, { message: 'Unauthorized' })
    if (url.includes('/products')) return json(200, [])
    return json(200, [])
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function loadApp() {
  vi.resetModules()
  vi.stubEnv('VITE_API_URL', 'https://api.nocturne.test')
  const app = await import('../App')
  const toast = await import('../components/Toast')
  const auth = await import('../store/useAuthStore')
  const cart = await import('../store/useCartStore')
  return { ...app, ...toast, ...auth, ...cart }
}

describe('Guest access (no forced login wall)', () => {
  const calls: FetchCall[] = []
  const startPath = window.location.pathname

  beforeEach(() => {
    calls.length = 0
    localStorage.clear()
    stubLiveApi(calls)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('lets a guest land on the home page without calling the protected /cart API', async () => {
    const { AppLayout, ToastProvider } = await loadApp()
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/']}>
          <AppLayout />
        </MemoryRouter>
      </ToastProvider>,
    )

    expect(await screen.findByText(/Authenticated Grails, Nocturnal Auctions/i)).toBeInTheDocument()
    // give mount effects time to run
    await new Promise(r => setTimeout(r, 50))
    expect(calls.some(c => c.url.endsWith('/cart'))).toBe(false)
    expect(window.location.pathname).toBe(startPath)
    expect(screen.queryByText(/COLLECTOR VAULT ACCESS/i)).not.toBeInTheDocument()
  })

  it('a 401 from any API call clears the session but never hard-redirects', async () => {
    const { useAuthStore } = await loadApp()
    const { api, UNAUTHORIZED_EVENT } = await import('../api/apiClient')
    localStorage.setItem('accessToken', 'expired-live-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'A', email: 'a@x', role: 'user' }))
    useAuthStore.getState().init()
    const heard = vi.fn()
    window.addEventListener(UNAUTHORIZED_EVENT, heard)

    await expect(api.get('/cart')).rejects.toThrow(/sign in/i)

    expect(heard).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(window.location.pathname).toBe(startPath)
    window.removeEventListener(UNAUTHORIZED_EVENT, heard)
  })

  it('keeps a guest bag locally and only gates checkout', async () => {
    const { AppLayout, ToastProvider, useCartStore, GUEST_BAG_STORAGE_KEY } = await loadApp()

    await useCartStore.getState().addItem(
      { productId: 1, name: 'Obsidian High-Top', price: 1000000, quantity: 1, size: '42' },
      false,
    )
    await useCartStore.getState().addItem(
      { productId: 1, name: 'Obsidian High-Top', price: 1000000, quantity: 2, size: '42' },
      false,
    )
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
    expect(JSON.parse(localStorage.getItem(GUEST_BAG_STORAGE_KEY) || '[]')).toHaveLength(1)
    expect(calls.some(c => c.url.includes('/cart'))).toBe(false)

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/checkout']}>
          <AppLayout />
        </MemoryRouter>
      </ToastProvider>,
    )
    // Guest is routed to the sign-in screen for checkout only.
    expect(await screen.findByText(/COLLECTOR VAULT ACCESS/i)).toBeInTheDocument()
    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(1))
  })
})
