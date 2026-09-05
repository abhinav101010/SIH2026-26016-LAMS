import { forwardRef } from 'react'

const ChartCard = forwardRef(({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  height = 'h-80',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        clay-card p-6
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || Icon || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon size={18} className="text-primary" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-foreground">{title}</h3>}
              {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={height}>
        {children}
      </div>
    </div>
  )
})

ChartCard.displayName = 'ChartCard'
export default ChartCard
