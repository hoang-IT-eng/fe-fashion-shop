import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api/apiClient'
import { NocturneMark } from '../../components/brand/NocturneMark'
import { useToast } from '../../components/Toast'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/auth/reset-password', {
        token: params.get('token') || 'demo-token',
        newPassword: password,
      })
      toast('Passkey updated. Sign in with your new credentials.', 'success')
      navigate('/auth')
    } catch (err: any) {
      toast(err?.message || 'Reset failed', 'error')
    }
  }

  return (
    <div className="min-h-[75vh] bg-ink text-bone flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-ink-raised border border-bone/15 p-8 space-y-5"
      >
        <NocturneMark className="w-10 h-10 mx-auto" />
        <h1 className="font-display text-3xl text-center">Set New Passkey</h1>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-1.5">
            New Vault Passkey
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 text-sm text-bone focus:outline-none focus:border-bone"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-widest"
        >
          Seal New Passkey
        </button>
      </form>
    </div>
  )
}
