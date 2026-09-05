import { forwardRef } from 'react'

const ClayInput = forwardRef(({
  label,
  helperText,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const inputClasses = [
    'w-full px-4 py-2.5 rounded-xl',
    'bg-surface border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
    'placeholder:text-text-tertiary text-foreground',
    error
      ? 'border-error-500 focus:ring-error-500/30 focus:border-error-500'
      : 'border-border hover:border-border-strong',
    Icon ? 'pl-11' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {props.required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        )}
        <input ref={ref} className={inputClasses} {...props} />
      </div>
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-tertiary">{helperText}</p>}
    </div>
  )
})

ClayInput.displayName = 'ClayInput'
export default ClayInput
