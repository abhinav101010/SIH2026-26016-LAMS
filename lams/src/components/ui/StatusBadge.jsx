import ClayBadge from './ClayBadge'

const StatusBadge = ({ status, size = 'md', showDot = true, dot, ...props }) => {
  return <ClayBadge status={status} size={size} dot={showDot || dot} {...props} />
}

export default StatusBadge
