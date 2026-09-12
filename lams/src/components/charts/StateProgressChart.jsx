import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="clay-card p-3 shadow-clay-md border border-border">
        <p className="text-xs font-medium text-foreground mb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning-500" />
            <span className="text-xs text-text-secondary">Proposed:</span>
            <span className="text-xs font-medium">{(payload[0]?.value || 0).toLocaleString('en-IN')} ha</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-500" />
            <span className="text-xs text-text-secondary">Acquired:</span>
            <span className="text-xs font-medium">{(payload[1]?.value || 0).toLocaleString('en-IN')} ha</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const StateProgressChart = ({ data }) => {
  const chartData = data.map((d) => ({
    state: d.state.replace(/ /g, '\n'),
    proposed: d.proposed,
    acquired: d.acquired,
  }))

  const maxValue = data.length > 0
    ? Math.max(...data.map((d) => d.proposed)) * 1.3
    : 100

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsla(210, 20%, 68%, 0.3)" horizontal={false} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: 'hsl(var(--color-text-tertiary))' }}
          domain={[0, maxValue]}
          tickFormatter={(v) => Math.round(v / 1000) + 'k'}
        />
        <YAxis
          type="category"
          dataKey="state"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--color-text))', fontWeight: 500 }}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsla(210, 50%, 60%, 0.2)' }} />
        <Bar dataKey="proposed" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={18} />
        <Bar dataKey="acquired" fill="#10B981" radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default StateProgressChart
