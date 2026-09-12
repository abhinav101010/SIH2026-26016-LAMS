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

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
  const radius = outerRadius + 18
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-[11px] font-medium fill-foreground"
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
      <PieChart margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          outerRadius={90}
          cx="50%"
          cy="50%"
          paddingAngle={3}
          cornerRadius={5}
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          iconSize={10}
          iconRadius={5}
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default AcquisitionStatusChart
