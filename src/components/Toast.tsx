import React, { useState, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let counter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-6 z-[115] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 border bg-[#111111]/95 backdrop-blur-md shadow-2xl text-xs tracking-wide ${
              t.type === 'success'
                ? 'border-[#f9f9f9]/60 text-[#f9f9f9]'
                : t.type === 'error'
                  ? 'border-red-500/60 text-red-200'
                  : 'border-[#f9f9f9]/20 text-[#f9f9f9]'
            }`}
          >
            {t.type === 'success' && (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#f9f9f9]" />
            )}
            {t.type === 'error' && (
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
            )}
            {t.type === 'info' && (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#a3a3a3]" />
            )}
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              className="text-[#a3a3a3] hover:text-[#f9f9f9] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
