import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { CinematicPreloader } from './components/experience/CinematicPreloader'
import { CloudCurtainTransition } from './components/experience/CloudCurtainTransition'
import { InitiationEasterEgg } from './components/experience/InitiationEasterEgg'
import { SmoothScroll } from './components/experience/SmoothScroll'
import { CustomCursor } from './components/experience/CustomCursor'
import { useCartStore } from './store/useCartStore'

import HomePage from './pages/HomePage'
import { RequireAuth } from './components/routing/RequireAuth'
import { RouteFallback } from './components/routing/RouteFallback'
import { useAuthStore } from './store/useAuthStore'
import { UNAUTHORIZED_EVENT } from './api/apiClient'

// Home stays in the entry chunk (it is the LCP route). Every other route,
// and especially the admin console, is split into its own chunk.
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const AuctionsPage = lazy(() => import('./pages/AuctionsPage'))
const MysteryBoxesPage = lazy(() => import('./pages/MysteryBoxesPage'))
const ConciergePage = lazy(() => import('./pages/ConciergePage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const JournalPage = lazy(() => import('./pages/JournalPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AuthPage = lazy(() => import('./pages/auth/AuthPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AiChatWidget = lazy(() =>
  import('./components/ai-chat/AiChatWidget').then(m => ({ default: m.AiChatWidget })),
)

export function AppLayout() {
  const fetchCart = useCartStore(s => s.fetchCart)
  const mergeGuestBag = useCartStore(s => s.mergeGuestBag)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  // Guests get their local bag; signed-in users get the server cart, with any
  // guest lines merged in first. Never call the protected /cart API as a guest.
  useEffect(() => {
    if (isAuthenticated) void mergeGuestBag()
    else void fetchCart()
  }, [isAuthenticated, fetchCart, mergeGuestBag])

  // An expired session clears auth state instead of redirecting the whole app.
  useEffect(() => {
    const onUnauthorized = () => useAuthStore.setState({ isAuthenticated: false, user: null })
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <SmoothScroll />
      <CinematicPreloader />
      <CloudCurtainTransition />
      <InitiationEasterEgg />
      <Header />
      <CartDrawer />

      <main id="main" className="flex-1">
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/mystery-boxes" element={<MysteryBoxesPage />} />
          <Route path="/concierge" element={<ConciergePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/orders/:id" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </main>

      <Footer />
      <Suspense fallback={null}>
        <AiChatWidget />
      </Suspense>
      {/* Fixed film-grain overlay above all content, below the cursor */}
      <div aria-hidden="true" className="film-grain" />
      <CustomCursor />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
