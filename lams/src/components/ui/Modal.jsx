import { useEffect } from 'react'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  overlayClassName = '',
  showClose = true,
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeMap = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    '3xl': 'max-w-6xl',
    full: 'max-w-7xl mx-4',
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-start justify-center
        bg-black/40 backdrop-blur-sm
        ${overlayClassName}
      `}
      onClick={onClose}
    >
      <div
        className={`
          clay-card shadow-clay-xl
          ${sizeMap[size] || sizeMap.md}
          w-full m-6
          animate-scale-in
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-surface transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && <div className="border-t border-border px-6 py-4 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
