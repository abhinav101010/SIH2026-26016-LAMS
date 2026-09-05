import { forwardRef } from 'react'

const ClayCard = forwardRef(({
  children,
  className = '',
  padding = 'md',
  hover = false,
  interactive = false,
  onClick,
  shadow = 'clay',
  rounded = 'xl',
  border = true,
  ...props
}, ref) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }

  const shadowMap = {
    clay: 'shadow-clay',
    sm: 'shadow-clay-sm',
    md: 'shadow-clay-md',
    lg: 'shadow-clay-lg',
    xl: 'shadow-clay-xl',
    hover: 'shadow-clay-hover',
  }

  const roundedMap = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
    none: 'rounded-none',
  }

  const baseClasses = [
    'bg-card',
    'border',
    border ? 'border-border' : 'border-transparent',
    roundedMap[rounded] || 'rounded-xl',
    shadowMap[shadow] || 'shadow-clay',
    'transition-all',
    'duration-300',
    'ease-out',
  ]

  if (hover && interactive) {
    baseClasses.push('hover:shadow-clay-hover', 'hover:translate-y-[-2px]', 'cursor-pointer')
  } else if (hover) {
    baseClasses.push('hover:shadow-clay-hover', 'hover:translate-y-[-2px]')
  }

  const classes = [...baseClasses, paddingMap[padding] || 'p-6', className].filter(Boolean).join(' ')

  return (
    <div
      ref={ref}
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
})

ClayCard.displayName = 'ClayCard'

export const ClayCardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>{children}</div>
)

ClayCardHeader.displayName = 'ClayCardHeader'

export const ClayCardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-foreground ${className}`} {...props}>{children}</h3>
)

ClayCardTitle.displayName = 'ClayCardTitle'

export const ClayCardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>{children}</div>
)

ClayCardContent.displayName = 'ClayCardContent'

export default ClayCard
