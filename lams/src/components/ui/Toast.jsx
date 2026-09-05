import { createContext, useState, useCallback, useContext } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

let toastId = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = ++toastId
    const newToast = {
      id,
      title: toast.title || '',
      message: toast.message || '',
      type: toast.type || 'info',
      duration: toast.duration ?? 4000,
      action: toast.action || null,
      ...toast,
    }
    setToasts((prev) => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (opts) => addToast({ ...opts, type: 'success' }),
    error: (opts) => addToast({ ...opts, type: 'error' }),
    warning: (opts) => addToast({ ...opts, type: 'warning' }),
    info: (opts) => addToast({ ...opts, type: 'info' }),
    dismiss: removeToast,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const toastConfig = {
  success: { icon: 'CheckCircle', bg: 'bg-success-500/10', border: 'border-success-500/30', iconColor: 'text-success-600' },
  error: { icon: 'XCircle', bg: 'bg-error-500/10', border: 'border-error-500/30', iconColor: 'text-error-600' },
  warning: { icon: 'AlertTriangle', bg: 'bg-warning-500/10', border: 'border-warning-500/30', iconColor: 'text-warning-600' },
  info: { icon: 'Info', bg: 'bg-info-500/10', border: 'border-info-500/30', iconColor: 'text-info-600' },
}

const iconMap = {
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 12l-10 10-10-10" /></svg>,
  XCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
  AlertTriangle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
}

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const config = toastConfig[toast.type] || toastConfig.info
        const Icon = iconMap[config.icon]
        return (
          <div
            key={toast.id}
            className={`
              clay-card p-4 shadow-clay-md
              ${config.bg} ${config.border}
              animate-fade-in
            `}
          >
            <div className="flex gap-3">
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <Icon />
              </div>
              <div className="flex-1">
                {toast.title && <p className="font-medium text-sm text-foreground">{toast.title}</p>}
                {toast.message && <p className="text-sm text-text-secondary mt-0.5">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-text-tertiary hover:text-foreground"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
