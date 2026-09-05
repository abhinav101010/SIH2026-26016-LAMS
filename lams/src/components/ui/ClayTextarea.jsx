import { forwardRef } from 'react'

const ClayTextarea = forwardRef(({
  label,
  helperText,
  error,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const textareaClasses = [
    'w-full px-4 py-2.5 rounded-xl',
    'bg-surface border transition-all duration-200 resize-y',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
    'placeholder:text-text-tertiary text-foreground',
    'min-h-[80px]',
    error
      ? 'border-error-500 focus:ring-error-500/30 focus:border-error-500'
      : 'border-border hover:border-border-strong',
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
      <textarea ref={ref} rows={rows} className={textareaClasses} {...props} />
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-tertiary">{helperText}</p>}
    </div>
  )
})

ClayTextarea.displayName = 'ClayTextarea'
export default ClayTextarea
