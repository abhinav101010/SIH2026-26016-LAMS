import { ArrowUpRight, Minus } from 'lucide-react'

const KPICard = ({
  title,
  value,
  icon: Icon,
  change = null,
  trend = 'up',
  prefix = '',
  suffix = '',
  color = 'primary',
  subtitle = '',
  className = '',
}) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-status-approved/10 text-status-approved',
    info: 'bg-status-review/10 text-status-review',
    warning: 'bg-status-pending/10 text-status-pending',
    error: 'bg-status-rejected/10 text-status-rejected',
  }

  const trendColors = {
    up: 'text-status-approved',
    down: 'text-status-rejected',
    neutral: 'text-foreground-tertiary',
  }

  const iconColor = colorMap[color] || colorMap.primary
  const trendColor = trendColors[trend] || trendColors.neutral

  return (
    <div className={`clay-card p-6 transition-all duration-300 hover:shadow-clay-hover hover:translate-y-[-2px] ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-2">
            {title}
          </p>
          <div className="text-3xl font-bold text-foreground mb-1">
            {prefix}{value}{suffix}
          </div>
          {subtitle && <p className="text-xs text-foreground-secondary mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconColor}`}>
          <Icon size={22} />
        </div>
      </div>

      {change !== null && (
        <div className="flex items-center gap-2 mt-3">
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
            {trend === 'up' && <ArrowUpRight size={12} />}
            {trend === 'down' && <ArrowUpRight size={12} className="rotate-180" />}
            {trend === 'neutral' && <Minus size={12} />}
            {change}
          </span>
          <span className="text-xs text-foreground-tertiary">vs. last period</span>
        </div>
      )}
    </div>
  )
}

export default KPICard
