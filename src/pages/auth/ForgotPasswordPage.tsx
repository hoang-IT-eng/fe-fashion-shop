import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/apiClient'
import { EnigmaCrest } from '../../components/EnigmaCrest'
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
    <div className="min-h-[75vh] bg-[#0a0a0a] text-[#f9f9f9] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111111] border border-[#f9f9f9]/15 p-8 space-y-6 text-center">
        <EnigmaCrest className="w-10 h-10 mx-auto" />
        <h1 className="font-display text-3xl">Passkey Recovery</h1>
        {sent ? (
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            If <strong className="text-[#f9f9f9]">{email}</strong> is registered in the ENIGMA
            Vault, a recovery link has been dispatched.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a3a3a3] mb-1.5">
                Registered Collector Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3.5 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[#f9f9f9]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-widest"
            >
              Send Recovery Cipher
            </button>
          </form>
        )}
        <Link
          to="/auth"
          className="inline-block font-mono text-xs uppercase tracking-widest text-[#f9f9f9]"
        >
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}
