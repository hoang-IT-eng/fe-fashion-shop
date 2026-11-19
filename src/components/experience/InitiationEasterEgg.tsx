import React, { useEffect, useRef, useState } from 'react'
import { X, Check, Copy } from 'lucide-react'
import { NocturneMark } from '../brand/NocturneMark'
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

      bufferRef.current = (bufferRef.current + e.key.toUpperCase()).slice(-8)
      if (bufferRef.current === 'NOCTURNE') {
        bufferRef.current = ''
        playChime()
        setOpen(true)
        void applyVoucherCode('NOCTURNE15')
          .then(() => {
            toast('Night Order Seal Revealed — NOCTURNE15 (15% Privilege) applied to bag.', 'success')
          })
          .catch(() => {})
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [applyVoucherCode, playChime, toast])

  if (!open) return null

  const handleCopy = () => {
    void navigator.clipboard?.writeText('NOCTURNE15').catch(() => {})
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
      <div className="relative w-full max-w-lg border border-bone/50 bg-ink text-bone p-8 md:p-10 shadow-2xl">
        <button
          id="close-initiation-modal"
          onClick={() => setOpen(false)}
          aria-label="Close Initiation Modal"
          className="absolute top-5 right-5 text-bone-muted hover:text-bone transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <NocturneMark className="w-12 h-12 mb-5" />
          <p className="font-mono text-[11px] tracking-[0.34em] text-bone uppercase mb-3">
            CIPHER ACCEPTED · NIGHT ORDER INITIATION
          </p>
          <h2
            id="initiation-modal-title"
            className="font-display text-3xl md:text-4xl text-bone tracking-wide mb-4"
          >
            You Found the Unlisted Threshold
          </h2>
          <p className="text-sm text-bone-muted leading-relaxed mb-7 max-w-md">
            Most visitors browse the surface. By keying the cipher, your session has been granted
            Night Order Allocation privileges—automatically applied to your Vault Bag and Checkout.
          </p>

          <div className="w-full border border-bone/40 bg-ink-raised px-5 py-4 flex items-center justify-between mb-6">
            <div className="text-left">
              <span className="block font-mono text-[10px] tracking-[0.26em] text-bone-muted uppercase">
                INITIATION PRIVILEGE CODE
              </span>
              <span className="font-mono text-xl tracking-[0.22em] text-bone font-semibold">
                NOCTURNE15
              </span>
            </div>
            <button
              id="copy-enigma15-btn"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 border border-bone/20 hover:border-bone px-3.5 py-2 text-xs font-mono tracking-widest uppercase text-bone transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-bone" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>

          <p className="font-mono text-[11px] text-bone-muted tracking-wider uppercase mb-6 tabular-nums">
            15% OFF ARCHIVE DROPS &amp; MYSTERY CHESTS · MAX 2,500,000₫ · ACTIVE IN BAG
          </p>

          <button
            id="confirm-initiation-btn"
            onClick={() => setOpen(false)}
            className="w-full py-3.5 bg-bone text-ink font-mono text-xs font-semibold tracking-[0.26em] uppercase hover:bg-bone-dim transition"
          >
            ENTER WITH PRIVILEGE
          </button>
        </div>
      </div>
    </div>
  )
}
