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
import { Paper, Box, Typography } from '@mui/material'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>{d.category}</Typography>
        <Typography variant="caption" color="text.secondary">Projects: {d.count}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Share: {d.percentage.toFixed(1)}%</Typography>
      </Paper>
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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" vertical={false} />
        <XAxis
          dataKey="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#64748b' }}
          domain={[0, 100]}
          tickFormatter={(v) => v + '%'}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.2)' }} />
        <ReferenceLine y={50} stroke="rgba(148, 163, 184, 0.5)" strokeDasharray="4 4" />
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
