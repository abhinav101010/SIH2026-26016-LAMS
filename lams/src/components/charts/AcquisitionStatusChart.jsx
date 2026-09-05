import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'

const statusColors = {
  pending: '#F59E0B',
  review: '#3B82F6',
  approved: '#10B981',
  acquired: '#059669',
  rejected: '#EF4444',
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="clay-card p-3 shadow-clay-md border border-border">
        <p className="text-xs font-medium text-foreground mb-1">{d.status}</p>
        <p className="text-xs text-text-secondary">Count: {d.count}</p>
        <p className="text-xs text-text-secondary">Amount: ₹{d.amount} Cr</p>
      </div>
    )
  }
  return null
}

const RADIAN = Math.PI * 2

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const cx2 = cx + 12
  const cy2 = cy + 12
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx2 + radius * Math.cos(-midAngle * RADIAN)
  const y = cy2 + (radius * 0.8) * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-xs font-medium fill-foreground"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const AcquisitionStatusChart = ({ data }) => {
  const chartData = data.map((d) => ({
    ...d,
    fill: statusColors[d.color] || '#9CA3AF',
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={80}
          outerRadius={120}
          cx="50%"
          cy="50%"
          paddingAngle={2}
          cornerRadius={6}
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconSize={10}
          iconRadius={6}
          layoutWidth="40%"
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default AcquisitionStatusChart
