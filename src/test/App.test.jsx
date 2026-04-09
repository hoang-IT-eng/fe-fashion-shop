import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock heavy components to keep tests fast
vi.mock('../components/ParallaxHero', () => ({ default: () => <div>ParallaxHero</div> }))
vi.mock('../components/AppleStyleProduct', () => ({ default: () => <div>AppleStyleProduct</div> }))
vi.mock('../pages/UsersPage', () => ({ default: () => <div>UsersPage</div> }))

describe('App', () => {
  it('renders home route without crashing', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(getByText('ParallaxHero')).toBeInTheDocument()
  })

  it('renders users route without crashing', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/users']}>
        <App />
      </MemoryRouter>
    )
    expect(getByText('UsersPage')).toBeInTheDocument()
  })
})
