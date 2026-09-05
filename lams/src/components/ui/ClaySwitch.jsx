import { forwardRef } from 'react'

const ClaySwitch = forwardRef(({
  label,
  description,
  checked,
  onChange,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`flex items-center justify-between cursor-pointer ${className}`}>
      <div className="flex-1">
        {label && <span className="text-sm font-medium text-foreground">{label}</span>}
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <div className="relative inline-block w-12 h-6">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="opacity-0 w-0 h-0"
          {...props}
        />
        <span
          className={`
            absolute inset-0 rounded-full transition-colors duration-300
            ${checked ? 'bg-primary' : 'bg-neutral-400'}
          `}
        >
          <span
            className={`
              absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300
              ${checked ? 'translate-x-6' : 'translate-x-0.5'}
            `}
          />
        </span>
      </div>
    </label>
  )
})

ClaySwitch.displayName = 'ClaySwitch'
export default ClaySwitch
