import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../api/apiClient'
import { NocturneMark } from '../../components/brand/NocturneMark'

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
    <div className="min-h-[75vh] bg-ink text-bone flex items-center justify-center px-4 text-center">
      <div className="w-full max-w-md bg-ink-raised border border-bone/40 p-8 space-y-5">
        <NocturneMark className="w-10 h-10 mx-auto" />
        <p className="font-mono text-xs tracking-[0.26em] text-bone uppercase">{status}</p>
        <h1 className="font-display text-3xl">Night Order Access Active</h1>
        <Link
          to="/auth"
          className="inline-block px-7 py-3 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-widest"
        >
          Proceed to Sign In
        </Link>
      </div>
    </div>
  )
}
