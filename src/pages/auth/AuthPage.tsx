import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { safeNext } from '../../lib/safeNext'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { NocturneMark } from '../../components/brand/NocturneMark'
import { useToast } from '../../components/Toast'

export default function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
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
        navigate(next || (currentUser?.role === 'admin' ? '/admin' : '/'))
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
      navigate(next || dest)
    } catch (err: any) {
      toast(err?.message || 'Quick login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[82vh] bg-ink text-bone flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md bg-ink-raised border border-bone/15 p-8 md:p-10 space-y-6">
        <div className="flex flex-col items-center text-center">
          <NocturneMark className="w-11 h-11 mb-4" />
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone">
            COLLECTOR VAULT ACCESS
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">
            {mode === 'login' ? 'Enter the Night Order' : 'Request Collector Passkey'}
          </h1>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 border border-bone/15 bg-ink">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2.5 font-mono text-xs uppercase tracking-widest ${
              mode === 'login' ? 'bg-bone text-ink font-semibold' : 'text-bone-muted'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2.5 font-mono text-xs uppercase tracking-widest ${
              mode === 'register' ? 'bg-bone text-ink font-semibold' : 'text-bone-muted'
            }`}
          >
            Initiate
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-1.5">
                Collector Alias / Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Kaelen Vinh"
                className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 text-sm text-bone focus:outline-none focus:border-bone"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-1.5">
              Email Address
            </label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="demo@fashionshop.com"
              className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 text-sm text-bone focus:outline-none focus:border-bone"
            />
          </div>

          <div>
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest mb-1.5">
              <span className="text-bone-muted">Passkey</span>
              {mode === 'login' && (
                <Link to="/auth/forgot-password" className="text-bone hover:underline">
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
              className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 text-sm text-bone focus:outline-none focus:border-bone"
            />
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-bone-dim transition"
          >
            {loading
              ? 'VERIFYING...'
              : mode === 'login'
                ? 'AUTHENTICATE PASSKEY'
                : 'CREATE COLLECTOR ACCOUNT'}
          </button>
        </form>

        {/* Instant Reviewer One-Click Access */}
        <div className="pt-5 border-t border-bone/10 space-y-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone-muted flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-bone" />
            1-Click Demo Vault Passkeys
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="demo-collector-login-btn"
              type="button"
              onClick={() => void quickLogin('demo@fashionshop.com', 'Demo@123', '/')}
              className="py-2.5 px-3 border border-bone/20 hover:border-bone font-mono text-[10px] uppercase tracking-wider text-bone transition"
            >
              Collector Access
            </button>
            <button
              id="demo-admin-login-btn"
              type="button"
              onClick={() => void quickLogin('admin@fashionshop.com', 'Admin@123', '/admin')}
              className="py-2.5 px-3 border border-bone/60 bg-bone/10 hover:bg-bone hover:text-ink font-mono text-[10px] uppercase tracking-wider text-bone transition"
            >
              Executive Admin
            </button>
          </div>
          <p className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-bone-muted pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-bone" />
            Works with live NestJS API or offline Demo Vault
          </p>
        </div>
      </div>
    </div>
  )
}
