import React from 'react'
import { NocturneMark } from './brand/NocturneMark'

interface Props {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6 border border-bone/10 bg-ink-raised/60">
      <NocturneMark className="w-10 h-10 mb-5 opacity-80" />
      <h3 className="font-display text-2xl tracking-wide text-bone mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-bone-muted max-w-md mb-7 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-bone text-ink px-7 py-3 font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-bone-dim transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
