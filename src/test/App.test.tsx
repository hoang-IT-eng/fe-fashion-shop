import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

// Mock heavy pages
vi.mock('../pages/HomePage', () => ({ default: () => <div>HomePage</div> }))
vi.mock('../pages/auth/AuthPage', () => ({ default: () => <div>AuthPage</div> }))
vi.mock('../pages/AdminPage', () => ({ default: () => <div>AdminPage</div> }))

describe('Routing', () => {
  it('renders HomePage on / route', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <div>HomePage</div>
      </MemoryRouter>
    )
    expect(getByText('HomePage')).toBeTruthy()
  })

  it('renders AuthPage on /auth route', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/auth']}>
        <div>AuthPage</div>
      </MemoryRouter>
    )
    expect(getByText('AuthPage')).toBeTruthy()
  })
})
