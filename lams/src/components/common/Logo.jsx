import { useState } from 'react'

const Logo = ({
  size = 'md',
  variant = 'full',
  className = '',
  animated = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const textSizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  }

  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      onMouseEnter={() => animated && setHovered(true)}
      onMouseLeave={() => animated && setHovered(false)}
    >
      <svg
        className={`
          ${sizeMap[size] || sizeMap.md}
          flex-shrink-0
          transition-transform duration-500
          ${animated && hovered ? 'scale-105' : ''}
        `}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer hexagon — digital connectivity / government structure */}
        <path
          d="M59.99 6 L100.77 36 V84 L59.99 114 L19.21 84 V36 Z"
          fill="hsl(var(--color-primary))"
          stroke="hsl(var(--color-primary))"
          strokeWidth="1"
          opacity="0.2"
        />

        {/* Inner polygon — land parcel */}
        <path
          d="M59.99 24 L85.35 40 V80 L59.99 96 L34.63 80 V40 Z"
          fill="hsl(var(--color-primary))"
          stroke="hsl(var(--color-primary-fg))"
          strokeWidth="1.5"
        />

        {/* Map grid lines — digital overlay */}
        <path d="M44.63 60 L75.35 60 M59.99 48 L59.99 72" stroke="hsl(var(--color-primary-fg))" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 36 L70 36 M50 84 L70 84" stroke="hsl(var(--color-primary))" strokeWidth="1.5" opacity="0.5" />

        {/* Corner markers — coordinates */}
        <circle cx="30" cy="32" r="3" fill="hsl(var(--color-accent))" />
        <circle cx="90" cy="32" r="3" fill="hsl(var(--color-accent))" />
        <circle cx="90" cy="88" r="3" fill="hsl(var(--color-accent))" />
        <circle cx="30" cy="88" r="3" fill="hsl(var(--color-accent))" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={`font-bold text-foreground ${textSizeMap[size] || textSizeMap.md} leading-tight`}>
            NLAMS
          </span>
          <span className="text-xs text-text-secondary font-medium leading-tight">
            National Land Acquisition & Management System
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
