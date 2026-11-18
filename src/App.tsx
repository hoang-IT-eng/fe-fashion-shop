import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { CinematicPreloader } from './components/experience/CinematicPreloader'
import { CloudCurtainTransition } from './components/experience/CloudCurtainTransition'
import { InitiationEasterEgg } from './components/experience/InitiationEasterEgg'
import { SmoothScroll } from './components/experience/SmoothScroll'
import { CustomCursor } from './components/experience/CustomCursor'
import { AiChatWidget } from './components/ai-chat/AiChatWidget'
import { useCartStore } from './store/useCartStore'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AuctionsPage from './pages/AuctionsPage'
import MysteryBoxesPage from './pages/MysteryBoxesPage'
import ConciergePage from './pages/ConciergePage'
import WishlistPage from './pages/WishlistPage'
import JournalPage from './pages/JournalPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/auth/AuthPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import NotFoundPage from './pages/NotFoundPage'

export function AppLayout() {
  const fetchCart = useCartStore(s => s.fetchCart)

  useEffect(() => {
    void fetchCart()
  }, [fetchCart])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f9f9f9] flex flex-col">
      <SmoothScroll />
      <CinematicPreloader />
      <CloudCurtainTransition />
      <InitiationEasterEgg />
      <Header />
      <CartDrawer />

      <main className="flex-1">
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
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <AiChatWidget />
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
