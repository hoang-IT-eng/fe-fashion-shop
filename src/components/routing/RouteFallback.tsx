import React from 'react'

/** Quiet placeholder while a route chunk streams in. Keeps layout height to avoid CLS. */
export function RouteFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <span aria-hidden="true" className="block h-px w-24 overflow-hidden bg-bone/10">
        <span className="block h-full w-1/3 bg-ember animate-[route-load_1.1s_ease-in-out_infinite]" />
      </span>
    </div>
  )
}
