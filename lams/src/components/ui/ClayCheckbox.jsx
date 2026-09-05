import { forwardRef } from 'react'

const ClayCheckbox = forwardRef(({
  label,
  description,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`flex items-start gap-3 mb-3 ${containerClassName}`}>
      <input
        ref={ref}
        type="checkbox"
        className={`
          h-4 w-4 rounded mt-0.5
          accent-primary cursor-pointer
          focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
      {(label || description) && (
        <div className="flex-1">
          {label && <label className="text-sm font-medium text-foreground cursor-pointer">{label}</label>}
          {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  )
})

ClayCheckbox.displayName = 'ClayCheckbox'
export default ClayCheckbox
