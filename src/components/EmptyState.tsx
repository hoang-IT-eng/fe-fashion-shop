import React from 'react'

interface Props {
  icon: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <span className="text-6xl mb-6 select-none">{icon}</span>
      <h3 className="text-lg font-light uppercase tracking-widest text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-8">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
