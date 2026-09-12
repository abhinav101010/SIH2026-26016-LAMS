import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { Paper, Box, Typography } from '@mui/material'

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
      <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>{d.status}</Typography>
        <Typography variant="caption" color="text.secondary">Count: {d.count}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Amount: ₹{d.amount} Cr</Typography>
      </Paper>
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
      style={{ fontSize: 11, fontWeight: 500, fill: '#0f172a' }}
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
