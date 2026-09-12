import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="clay-card p-3 shadow-clay-md border border-border">
        <p className="text-xs text-text-secondary mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-text-secondary">{entry.name}</span>
              <span className="text-xs font-medium text-foreground">{entry.value} ha</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

const AcquisitionProgressChart = ({ data }) => {
  const maxValue = data.length > 0
    ? Math.max(...data.map((d) => d.acquired), ...data.map((d) => d.proposed)) * 1.2
    : 100

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="acquiredGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="proposedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsla(210, 20%, 68%, 0.3)" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--color-text-tertiary))' }}
          tickMargin={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: 'hsl(var(--color-text-tertiary))' }}
          tickMargin={4}
          domain={[0, maxValue]}
          tickFormatter={(v) => Math.round(v / 1000) + 'k'}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsla(210, 50%, 60%, 0.3)' }} />
        <Area
          type="monotone"
          dataKey="proposed"
          stroke="#6366F1"
          strokeWidth={2}
          fill="url(#proposedGradient)"
          dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#4F46E5', strokeWidth: 0 }}
          animationDuration={1500}
        />
        <Area
          type="monotone"
          dataKey="acquired"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#acquiredGradient)"
          dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#059669', strokeWidth: 0 }}
          animationDuration={1500}
          animationDelay={200}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default AcquisitionProgressChart
