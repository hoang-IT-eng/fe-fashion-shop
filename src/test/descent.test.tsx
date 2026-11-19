import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { AppLayout } from '../App'
import { ToastProvider } from '../components/Toast'
import { resetDemoVault } from '../api/enigmaDemoEngine'
import { useAuthStore } from '../store/useAuthStore'
import { DESCENT, pickTriptych } from '../components/home/DescentHero'
import { cloudsSupported, __resetCloudSupport } from '../components/experience/cloud/cloudState'
import type { Product } from '../types/product'

const renderApp = (path = '/') =>
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppLayout />
      </MemoryRouter>
    </ToastProvider>
  )

describe('PR 2 · The Descent', () => {
  beforeEach(() => {
    localStorage.clear()
    resetDemoVault()
    __resetCloudSupport()
    useAuthStore.setState({ isAuthenticated: false, user: null })
  })

  it('never lets products share the screen with the headline', () => {
    expect(DESCENT.titleOut[1]).toBeLessThan(DESCENT.revealIn[0])
    expect(DESCENT.revealIn[0] - DESCENT.titleOut[1]).toBeGreaterThanOrEqual(0.2)
  })

  it('picks three products with distinct imagery for the triptych', () => {
    const mk = (id: number, img: string) => ({ id, name: `P${id}`, imageUrl: img, price: 1 }) as unknown as Product
    const picks = pickTriptych([mk(1, 'a.jpg'), mk(2, 'a.jpg'), mk(3, 'b.jpg'), mk(4, 'c.jpg'), mk(5, 'd.jpg')])
    expect(picks.map(p => p.id)).toEqual([1, 3, 4])
  })

  it('falls back to the static painting (no WebGL, no three) when motion is disabled', async () => {
    expect(cloudsSupported()).toBe(false)
    const { container } = renderApp('/')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Authenticated Grails/)
    expect(screen.queryByText(/cryptographically/i)).toBeNull()
    expect(screen.getByText(/add two minutes/i)).toBeInTheDocument()
    expect(container.querySelector('canvas')).toBeNull()
    // static triptych is a normal, reachable section
    expect(screen.getByRole('heading', { name: /The vault, opened/i })).toBeInTheDocument()
  })

  it('opens the cloud menu as a modal dialog and closes it with Escape', async () => {
    renderApp('/')
    const toggle = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(toggle)
    const dialog = await screen.findByRole('dialog', { name: /site menu/i })
    expect(within(dialog).getByRole('link', { name: /Live Auctions/i })).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'))
  })

  it('renders the footer coda with an ascend control', async () => {
    renderApp('/products')
    expect(await screen.findByRole('region', { name: /end of the reel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ascend/i })).toBeInTheDocument()
  })
})
