import React from 'react'
import { Link } from 'react-router-dom'
import { EnigmaCrest } from '../components/EnigmaCrest'

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] bg-[#0a0a0a] text-[#f9f9f9] flex flex-col items-center justify-center px-6 text-center">
      <EnigmaCrest className="w-12 h-12 mb-6 opacity-80" />
      <p className="font-mono text-xs tracking-[0.34em] uppercase text-[#f9f9f9] mb-2">
        404 · UNLISTED CORRIDOR
      </p>
      <h1 className="font-display text-4xl md:text-6xl mb-4">This Vault Chamber Does Not Exist</h1>
      <p className="text-sm text-[#a3a3a3] max-w-md mb-8">
        The dossier or archive allocation you requested has been sealed or relocated.
      </p>
      <Link
        to="/"
        className="px-8 py-3.5 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-[#d9d9d9] transition"
      >
        Return to ENIGMA Archive
      </Link>
    </div>
  )
}
