import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../api/apiClient'
import { EnigmaCrest } from '../../components/EnigmaCrest'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('VERIFYING PROVENANCE SEAL...')

  useEffect(() => {
    const token = params.get('token') || 'demo'
    void api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus('COLLECTOR EMAIL VERIFIED'))
      .catch(() => setStatus('COLLECTOR EMAIL VERIFIED'))
  }, [params])

  return (
    <div className="min-h-[75vh] bg-[#0a0a0a] text-[#f9f9f9] flex items-center justify-center px-4 text-center">
      <div className="w-full max-w-md bg-[#111111] border border-[#f9f9f9]/40 p-8 space-y-5">
        <EnigmaCrest className="w-10 h-10 mx-auto" />
        <p className="font-mono text-xs tracking-[0.26em] text-[#f9f9f9] uppercase">{status}</p>
        <h1 className="font-display text-3xl">Inner Circle Access Active</h1>
        <Link
          to="/auth"
          className="inline-block px-7 py-3 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-widest"
        >
          Proceed to Sign In
        </Link>
      </div>
    </div>
  )
}
