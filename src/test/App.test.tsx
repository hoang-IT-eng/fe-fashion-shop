import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { AppLayout } from '../App'
import { ToastProvider } from '../components/Toast'
import { resetDemoVault } from '../api/enigmaDemoEngine'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'

describe('ENIGMA Storefront & Admin Routing', () => {
  beforeEach(() => {
    localStorage.clear()
    resetDemoVault()
    useAuthStore.setState({ isAuthenticated: false, user: null })
    useCartStore.setState({ items: [], appliedVoucher: null, drawerOpen: false })
  })

  it('renders HomePage hero, manifesto, and live grail sections on /', async () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/']}>
          <AppLayout />
        </MemoryRouter>
      </ToastProvider>
    )

    expect(
      await screen.findByText(/Authenticated Grails, Nocturnal Auctions/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Curated Grail Drops/i)).toBeInTheDocument()
    expect(screen.getByText(/Trending Grail Auctions/i)).toBeInTheDocument()
  })

  it('unlocks Inner Circle Initiation modal and auto-applies ENIGMA15 when typing ENIGMA', async () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/products']}>
          <AppLayout />
        </MemoryRouter>
      </ToastProvider>
    )

    for (const ch of ['E', 'N', 'I', 'G', 'M', 'A']) {
      fireEvent.keyDown(window, { key: ch })
    }

    expect(
      await screen.findByText(/You Found the Unlisted Threshold/i)
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(useCartStore.getState().appliedVoucher?.code).toBe('ENIGMA15')
    })
  })

  it('renders Executive Grail Desk when authenticated as admin on /admin', async () => {
    await useAuthStore.getState().login('admin@fashionshop.com', 'Admin@123')

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <AppLayout />
        </MemoryRouter>
      </ToastProvider>
    )

    expect(
      await screen.findByText(/ENIGMA Executive Commerce & Grail Desk/i)
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/Revenue, Velocity & Vault Risk/i)
    ).toBeInTheDocument()
  })
})
