import React from 'react'
import { EnigmaCrest } from './EnigmaCrest'

interface Props {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6 border border-[#ece5d8]/10 bg-[#111115]/60">
      <EnigmaCrest className="w-10 h-10 mb-5 opacity-80" />
      <h3 className="font-display text-2xl tracking-wide text-[#ece5d8] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#9a948a] max-w-md mb-7 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#cfa156] text-[#070709] px-7 py-3 font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-[#dec37b] transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
