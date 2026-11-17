import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api/apiClient'
import { EnigmaCrest } from '../../components/EnigmaCrest'
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
    <div className="min-h-[75vh] bg-[#070709] text-[#ece5d8] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#111115] border border-[#ece5d8]/15 p-8 space-y-5"
      >
        <EnigmaCrest className="w-10 h-10 mx-auto" />
        <h1 className="font-display text-3xl text-center">Set New Passkey</h1>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
            New Vault Passkey
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 text-sm text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-widest"
        >
          Seal New Passkey
        </button>
      </form>
    </div>
  )
}
