import React, { useEffect, useState, createContext, useContext, useCallback } from 'react'
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
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => (
          <div key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in
              ${t.type === 'success' ? 'bg-green-600 text-white'
              : t.type === 'error' ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-white'}`}>
            {t.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {t.type === 'error' && <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {t.type === 'info' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
