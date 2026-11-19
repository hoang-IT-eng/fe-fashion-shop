import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

/**
 * Gate for the few routes that genuinely need a session
 * (checkout, orders, profile, admin). Everything else stays public.
 * Guests are sent to /auth with a `next` param so they come straight back.
 */
export function RequireAuth({ children }: { children: React.ReactElement }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?next=${next}`} replace />
  }
  return children
}
