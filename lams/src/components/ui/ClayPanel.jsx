import { forwardRef } from 'react'

const ClayPanel = forwardRef(({
  children,
  className = '',
  title,
  subtitle,
  icon: Icon,
  action,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-card border border-border rounded-2xl
        shadow-clay transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || Icon || action) && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon size={16} className="text-primary" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-foreground">{title}</h3>}
              {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
})

ClayPanel.displayName = 'ClayPanel'
export default ClayPanel
