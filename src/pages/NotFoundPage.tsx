import React from 'react'
import { Link } from 'react-router-dom'
import { NocturneMark } from '../components/brand/NocturneMark'

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] bg-ink text-bone flex flex-col items-center justify-center px-6 text-center">
      <NocturneMark className="w-12 h-12 mb-6 opacity-80" />
      <p className="font-mono text-xs tracking-[0.34em] uppercase text-bone mb-2">
        404 · UNLISTED CORRIDOR
      </p>
      <h1 className="font-display text-4xl md:text-6xl mb-4">This Vault Chamber Does Not Exist</h1>
      <p className="text-sm text-bone-muted max-w-md mb-8">
        The dossier or archive allocation you requested has been sealed or relocated.
      </p>
      <Link
        to="/"
        className="px-8 py-3.5 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-bone-dim transition"
      >
        Return to NOCTURNE Archive
      </Link>
    </div>
  )
}
