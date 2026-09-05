import { forwardRef } from 'react'

const ClaySelect = forwardRef(({
  label,
  helperText,
  error,
  options = [],
  placeholder = 'Select...',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const selectClasses = [
    'w-full px-4 py-2.5 rounded-xl',
    'bg-surface border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
    'text-foreground appearance-none cursor-pointer',
    'pr-10',
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
      <div className="relative">
        <select ref={ref} className={selectClasses} {...props}>
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={16} />
      </div>
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-tertiary">{helperText}</p>}
    </div>
  )
})

const ChevronDown = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

ClaySelect.displayName = 'ClaySelect'
export default ClaySelect
