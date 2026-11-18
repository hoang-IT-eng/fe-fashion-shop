import React, { useEffect, useRef, useState } from 'react'
import { X, Check, Copy } from 'lucide-react'
import { EnigmaCrest } from '../EnigmaCrest'
import { useCartStore } from '../../store/useCartStore'
import { useSoundStore } from '../../store/useSoundStore'
import { useToast } from '../Toast'

export function InitiationEasterEgg() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const bufferRef = useRef('')
  const applyVoucherCode = useCartStore(s => s.applyVoucherCode)
  const playChime = useSoundStore(s => s.playChime)
  const { toast } = useToast()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.key.length !== 1) return

      bufferRef.current = (bufferRef.current + e.key.toUpperCase()).slice(-6)
      if (bufferRef.current === 'ENIGMA') {
        bufferRef.current = ''
        playChime()
        setOpen(true)
        void applyVoucherCode('ENIGMA15')
          .then(() => {
            toast('Inner Circle Seal Decoded — ENIGMA15 (15% Privilege) applied to bag.', 'success')
          })
          .catch(() => {})
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [applyVoucherCode, playChime, toast])

  if (!open) return null

  const handleCopy = () => {
    void navigator.clipboard?.writeText('ENIGMA15').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      id="enigma-initiation-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="initiation-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg border border-[#f9f9f9]/50 bg-[#0a0a0a] text-[#f9f9f9] p-8 md:p-10 shadow-2xl">
        <button
          id="close-initiation-modal"
          onClick={() => setOpen(false)}
          aria-label="Close Initiation Modal"
          className="absolute top-5 right-5 text-[#a3a3a3] hover:text-[#f9f9f9] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <EnigmaCrest className="w-12 h-12 mb-5" />
          <p className="font-mono text-[11px] tracking-[0.34em] text-[#f9f9f9] uppercase mb-3">
            CIPHER ACCEPTED · INNER CIRCLE INITIATION
          </p>
          <h2
            id="initiation-modal-title"
            className="font-display text-3xl md:text-4xl text-[#f9f9f9] tracking-wide mb-4"
          >
            You Found the Unlisted Threshold
          </h2>
          <p className="text-sm text-[#a3a3a3] leading-relaxed mb-7 max-w-md">
            Most visitors browse the surface. By keying the cipher, your session has been granted
            Inner Circle Allocation privileges—automatically applied to your Vault Bag and Checkout.
          </p>

          <div className="w-full border border-[#f9f9f9]/40 bg-[#111111] px-5 py-4 flex items-center justify-between mb-6">
            <div className="text-left">
              <span className="block font-mono text-[10px] tracking-[0.26em] text-[#a3a3a3] uppercase">
                INITIATION PRIVILEGE CODE
              </span>
              <span className="font-mono text-xl tracking-[0.22em] text-[#f9f9f9] font-semibold">
                ENIGMA15
              </span>
            </div>
            <button
              id="copy-enigma15-btn"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 border border-[#f9f9f9]/20 hover:border-[#f9f9f9] px-3.5 py-2 text-xs font-mono tracking-widest uppercase text-[#f9f9f9] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#f9f9f9]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>

          <p className="font-mono text-[11px] text-[#a3a3a3] tracking-wider uppercase mb-6 tabular-nums">
            15% OFF ARCHIVE DROPS &amp; MYSTERY CHESTS · MAX 2,500,000₫ · ACTIVE IN BAG
          </p>

          <button
            id="confirm-initiation-btn"
            onClick={() => setOpen(false)}
            className="w-full py-3.5 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold tracking-[0.26em] uppercase hover:bg-[#d9d9d9] transition"
          >
            ENTER WITH PRIVILEGE
          </button>
        </div>
      </div>
    </div>
  )
}
