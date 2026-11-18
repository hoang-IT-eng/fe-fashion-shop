import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { EnigmaCrest } from '../../components/EnigmaCrest'
import { useToast } from '../../components/Toast'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, register } = useAuthStore()
  const { toast } = useToast()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (mode === 'login') {
        await login(email, password)
        const currentUser = useAuthStore.getState().user
        toast(`Welcome back, ${currentUser?.name || 'Collector'}.`, 'success')
        navigate(currentUser?.role === 'admin' ? '/admin' : '/')
      } else {
        const msg = await register(name, email, password)
        toast(msg || 'Registration complete. Sign in below.', 'success')
        setMode('login')
      }
    } catch (err: any) {
      toast(err?.message || 'Authentication failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (demoEmail: string, demoPass: string, dest: string) => {
    try {
      setLoading(true)
      await login(demoEmail, demoPass)
      toast(`Authenticated as ${demoEmail}`, 'success')
      navigate(dest)
    } catch (err: any) {
      toast(err?.message || 'Quick login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[82vh] bg-[#0a0a0a] text-[#f9f9f9] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md bg-[#111111] border border-[#f9f9f9]/15 p-8 md:p-10 space-y-6">
        <div className="flex flex-col items-center text-center">
          <EnigmaCrest className="w-11 h-11 mb-4" />
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#f9f9f9]">
            COLLECTOR VAULT ACCESS
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">
            {mode === 'login' ? 'Enter the Inner Circle' : 'Request Collector Passkey'}
          </h1>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 border border-[#f9f9f9]/15 bg-[#0a0a0a]">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2.5 font-mono text-xs uppercase tracking-widest ${
              mode === 'login' ? 'bg-[#f9f9f9] text-[#0a0a0a] font-semibold' : 'text-[#a3a3a3]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2.5 font-mono text-xs uppercase tracking-widest ${
              mode === 'register' ? 'bg-[#f9f9f9] text-[#0a0a0a] font-semibold' : 'text-[#a3a3a3]'
            }`}
          >
            Initiate
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a3a3a3] mb-1.5">
                Collector Alias / Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Kaelen Vinh"
                className="w-full bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3.5 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[#f9f9f9]"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a3a3a3] mb-1.5">
              Email Address
            </label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="demo@fashionshop.com"
              className="w-full bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3.5 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[#f9f9f9]"
            />
          </div>

          <div>
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest mb-1.5">
              <span className="text-[#a3a3a3]">Passkey</span>
              {mode === 'login' && (
                <Link to="/auth/forgot-password" className="text-[#f9f9f9] hover:underline">
                  Reset Passkey
                </Link>
              )}
            </div>
            <input
              id="auth-password-input"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3.5 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[#f9f9f9]"
            />
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-[#d9d9d9] transition"
          >
            {loading
              ? 'VERIFYING...'
              : mode === 'login'
                ? 'AUTHENTICATE PASSKEY'
                : 'CREATE COLLECTOR ACCOUNT'}
          </button>
        </form>

        {/* Instant Reviewer One-Click Access */}
        <div className="pt-5 border-t border-[#f9f9f9]/10 space-y-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a3a3a3] flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#f9f9f9]" />
            1-Click Demo Vault Passkeys
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="demo-collector-login-btn"
              type="button"
              onClick={() => void quickLogin('demo@fashionshop.com', 'Demo@123', '/')}
              className="py-2.5 px-3 border border-[#f9f9f9]/20 hover:border-[#f9f9f9] font-mono text-[10px] uppercase tracking-wider text-[#f9f9f9] transition"
            >
              Collector Access
            </button>
            <button
              id="demo-admin-login-btn"
              type="button"
              onClick={() => void quickLogin('admin@fashionshop.com', 'Admin@123', '/admin')}
              className="py-2.5 px-3 border border-[#f9f9f9]/60 bg-[#f9f9f9]/10 hover:bg-[#f9f9f9] hover:text-[#0a0a0a] font-mono text-[10px] uppercase tracking-wider text-[#f9f9f9] transition"
            >
              Executive Admin
            </button>
          </div>
          <p className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-[#a3a3a3] pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#f9f9f9]" />
            Works with live NestJS API or offline Demo Vault
          </p>
        </div>
      </div>
    </div>
  )
}
