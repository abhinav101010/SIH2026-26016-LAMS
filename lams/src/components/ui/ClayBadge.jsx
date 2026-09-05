import { forwardRef } from 'react'

const statusConfig = {
  approved: { bg: 'bg-status-approved/10', text: 'text-status-approved', dot: 'bg-status-approved', label: 'Approved' },
  pending: { bg: 'bg-status-pending/10', text: 'text-status-pending', dot: 'bg-status-pending', label: 'Pending' },
  rejected: { bg: 'bg-status-rejected/10', text: 'text-status-rejected', dot: 'bg-status-rejected', label: 'Rejected' },
  review: { bg: 'bg-status-review/10', text: 'text-status-review', dot: 'bg-status-review', label: 'Under Review' },
  acquired: { bg: 'bg-status-approved/10', text: 'text-status-approved', dot: 'bg-status-approved', label: 'Acquired' },
  possession: { bg: 'bg-status-approved/10', text: 'text-status-approved', dot: 'bg-status-approved', label: 'Possession' },
  delayed: { bg: 'bg-status-rejected/10', text: 'text-status-rejected', dot: 'bg-status-rejected', label: 'Delayed' },
  disputed: { bg: 'bg-status-notification/10', text: 'text-status-notification', dot: 'bg-status-notification', label: 'Disputed' },
  notification: { bg: 'bg-status-review/10', text: 'text-status-review', dot: 'bg-status-review', label: 'Notification Issued' },
  award: { bg: 'bg-status-pending/10', text: 'text-status-pending', dot: 'bg-status-pending', label: 'Award Declared' },
  proposed: { bg: 'bg-status-pending/10', text: 'text-status-pending', dot: 'bg-status-pending', label: 'Proposed' },
}

const ClayBadge = forwardRef(({
  status = 'default',
  children,
  className = '',
  size = 'md',
  dot = true,
  ...props
}, ref) => {
  const config = statusConfig[status] || {
    bg: 'bg-foreground/5',
    text: 'text-foreground-secondary',
    dot: 'bg-foreground-tertiary',
    label: status,
  }

  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const displayText = children !== undefined ? children : config.label

  return (
    <span
      ref={ref}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bg} ${config.text}
        ${sizeMap[size] || sizeMap.md}
        ${className}
      `}
      {...props}
    >
      {dot && <span className={`w-2 h-2 rounded-full ${config.dot}`} />}
      {displayText}
    </span>
  )
})

ClayBadge.displayName = 'ClayBadge'
export default ClayBadge
