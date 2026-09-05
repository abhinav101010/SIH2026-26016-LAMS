import { forwardRef } from 'react'

const ClayButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = 'lg',
  onClick,
  ...props
}, ref) => {
  const variantMap = {
    primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-clay-btn hover:shadow-clay-btn-hover',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover shadow-clay-btn hover:shadow-clay-btn-hover',
    accent: 'bg-accent text-white hover:brightness-110 shadow-clay-btn hover:shadow-clay-btn-hover',
    outline: 'bg-transparent border border-border text-foreground hover:bg-surface shadow-clay-sm',
    ghost: 'bg-transparent text-foreground-secondary hover:bg-surface hover:text-foreground shadow-none',
    success: 'bg-success-600 text-white hover:bg-success-700 shadow-clay-btn hover:shadow-clay-btn-hover',
    danger: 'bg-error-600 text-white hover:bg-error-700 shadow-clay-btn hover:shadow-clay-btn-hover',
  }

  const sizeMap = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-3.5 text-lg',
  }

  const roundedMap = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
    none: 'rounded-none',
  }

  const classes = [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    roundedMap[rounded] || 'rounded-xl',
    variantMap[variant] || variantMap.primary,
    sizeMap[size] || sizeMap.md,
    fullWidth ? 'w-full' : '',
    (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.125 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {Icon && !loading && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
      {Icon && !loading && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
    </button>
  )
})

ClayButton.displayName = 'ClayButton'
export default ClayButton
