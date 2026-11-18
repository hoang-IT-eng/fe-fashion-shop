import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="bg-[#111111] border border-[#f9f9f9]/15 w-full max-w-md p-6 shadow-2xl text-[#f9f9f9]">
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-10 h-10 border flex items-center justify-center flex-shrink-0 ${
              danger
                ? 'border-red-500/40 bg-red-950/40 text-red-400'
                : 'border-[#f9f9f9]/40 bg-[#f9f9f9]/10 text-[#f9f9f9]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-xl text-[#f9f9f9] mb-1">{title}</h3>
            <p className="text-sm text-[#a3a3a3] leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-[#f9f9f9]/20 py-2.5 font-mono text-xs uppercase tracking-widest text-[#f9f9f9] hover:border-[#f9f9f9]/50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest transition ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-[#f9f9f9] text-[#0a0a0a] hover:bg-[#d9d9d9]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
