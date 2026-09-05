const ClayRadio = ({
  label,
  description,
  value,
  className = '',
  ...props
}) => {
  return (
    <label className={`flex items-start gap-3 mb-3 cursor-pointer ${className}`}>
      <input
        type="radio"
        value={value}
        className={`
          h-4 w-4 mt-0.5
          accent-primary cursor-pointer
          focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
          transition-all duration-200
        `}
        {...props}
      />
      {(label || description) && (
        <div className="flex-1">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  )
}

export default ClayRadio
