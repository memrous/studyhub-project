/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
// variant: 'success' | 'error' | 'info'
// { id: string, variant: string, message: string }

const ToastContext = createContext(null)

const AUTO_DISMISS_MS = 4000

const VARIANT_STYLES = {
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: 'text-emerald-500',
    bar: 'bg-emerald-400',
    Icon: CheckCircle,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: 'text-red-500',
    bar: 'bg-red-400',
    Icon: XCircle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'text-blue-500',
    bar: 'bg-blue-400',
    Icon: Info,
  },
}

// ── Single Toast card ─────────────────────────────────────────────
const ToastCard = ({ id, variant, message, onDismiss }) => {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info
  const { Icon } = styles

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]
        rounded-xl border shadow-lg px-4 py-3.5 font-inter overflow-hidden
        ${styles.container}
        animate-in slide-in-from-right-full fade-in duration-300
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-[3px] ${styles.bar} rounded-b-xl`}
        style={{ animation: `studyhub-toast-shrink ${AUTO_DISMISS_MS}ms linear forwards` }}
      />

      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${styles.icon}`} />

      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>

      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 -mt-0.5 -mr-1 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Provider ──────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const counterRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((variant, message) => {
    const id = `toast-${++counterRef.current}`
    setToasts((prev) => [...prev, { id, variant, message }])
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
  }, [dismiss])

  const toast = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error',   msg),
    info:    (msg) => addToast('info',    msg),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Fixed container — bottom-right on desktop, bottom-center on mobile */}
      <div
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard
              id={t.id}
              variant={t.variant}
              message={t.message}
              onDismiss={dismiss}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
