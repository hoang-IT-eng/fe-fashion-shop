import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Compass } from 'lucide-react'
import { api } from '../api/apiClient'
import { TasteCodexResult } from '../types/enigma'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '../components/Toast'

export default function ProfilePage() {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [codex, setCodex] = useState<TasteCodexResult | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void api
      .get<{ name: string; email: string; phone?: string; address?: string }>('/users/me')
      .then(u => {
        setName(u.name || '')
        setEmail(u.email || '')
        setPhone(u.phone || '')
        setAddress(u.address || '')
      })
    void api
      .get<TasteCodexResult | null>('/mystery-boxes/my-codex')
      .then(setCodex)
      .catch(() => {})
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.put('/users/me', { name, phone, address })
      toast('Collector Dossier updated.', 'success')
    } catch (err: any) {
      toast(err?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070709] text-[#ece5d8] py-10 md:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Archive', path: '/' }, { label: 'Collector Dossier' }]} />

        <h1 className="font-display text-4xl md:text-5xl text-[#ece5d8] pb-8 border-b border-[#ece5d8]/10 mb-10">
          Collector Identity &amp; Codex
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleSave}
            className="lg:col-span-7 bg-[#111115] border border-[#ece5d8]/15 p-6 md:p-8 space-y-5"
          >
            <h2 className="font-display text-2xl">Vault Dispatch Credentials</h2>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 text-sm text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-[#070709]/60 border border-[#ece5d8]/10 px-3.5 py-2.5 text-sm text-[#9a948a]"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                Courier Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 font-mono text-sm text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                Primary Vault Delivery Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 text-sm text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.24em]"
            >
              {saving ? 'Saving...' : 'Save Dossier'}
            </button>
          </form>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-[#111115] border border-[#cfa156]/45 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#cfa156]">
                <Compass className="w-4 h-4" />
                <span>Taste Codex Archetype</span>
              </div>
              {codex ? (
                <>
                  <h3 className="font-display text-3xl text-[#ece5d8]">{codex.archetype}</h3>
                  <p className="text-xs text-[#9a948a] leading-relaxed">{codex.description}</p>
                  <Link
                    to="/mystery-boxes"
                    className="inline-block font-mono text-xs uppercase tracking-widest text-[#cfa156] hover:underline"
                  >
                    Recalibrate 8-Step Codex →
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#9a948a]">
                    Complete the 8-step Style Decoder to bind your Taste Codex to your profile.
                  </p>
                  <Link
                    to="/mystery-boxes"
                    className="inline-block px-5 py-2.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-widest"
                  >
                    Start Quiz
                  </Link>
                </>
              )}
            </div>

            <div className="p-5 bg-[#111115] border border-[#ece5d8]/12 flex items-center gap-3 font-mono text-xs text-[#9a948a]">
              <ShieldCheck className="w-5 h-5 text-[#cfa156]" />
              <span>Inner Circle Standing: VERIFIED COLLECTOR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
