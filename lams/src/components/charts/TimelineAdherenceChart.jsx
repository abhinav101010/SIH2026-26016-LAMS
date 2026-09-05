import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="clay-card p-3 shadow-clay-md border border-border">
        <p className="text-xs font-medium text-foreground mb-1">{d.category}</p>
        <p className="text-xs text-text-secondary">Projects: {d.count}</p>
        <p className="text-xs text-text-secondary">Share: {d.percentage.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

const TimelineAdherenceChart = ({ data }) => {
  const chartData = data.map((d) => ({
    category: d.category,
    count: d.count,
    percentage: d.percentage,
    fill: d.category === 'On Track' ? '#10B981' : d.category === 'At Risk' ? '#F59E0B' : '#EF4444',
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsla(210, 20%, 68%, 0.3)" vertical={false} />
        <XAxis
          dataKey="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--color-text))', fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: 'hsl(var(--color-text-tertiary))' }}
          domain={[0, 100]}
          tickFormatter={(v) => v + '%'}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsla(210, 50%, 60%, 0.2)' }} />
        <ReferenceLine y={50} stroke="hsla(210, 20%, 68%, 0.5)" strokeDasharray="4 4" />
        <Bar dataKey="percentage" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default TimelineAdherenceChart
