import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/apiClient'
import { NocturneMark } from '../../components/brand/NocturneMark'
import { useToast } from '../../components/Toast'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast('Recovery cipher dispatched to your email.', 'success')
    } catch (err: any) {
      toast(err?.message || 'Request failed', 'error')
    }
  }

  return (
    <div className="min-h-[75vh] bg-ink text-bone flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-ink-raised border border-bone/15 p-8 space-y-6 text-center">
        <NocturneMark className="w-10 h-10 mx-auto" />
        <h1 className="font-display text-3xl">Passkey Recovery</h1>
        {sent ? (
          <p className="text-xs text-bone-muted leading-relaxed">
            If <strong className="text-bone">{email}</strong> is registered in the NOCTURNE
            Vault, a recovery link has been dispatched.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-1.5">
                Registered Collector Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 text-sm text-bone focus:outline-none focus:border-bone"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-widest"
            >
              Send Recovery Cipher
            </button>
          </form>
        )}
        <Link
          to="/auth"
          className="inline-block font-mono text-xs uppercase tracking-widest text-bone"
        >
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}
