import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Paper, Box, Typography } from '@mui/material'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>{label}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {payload.map((entry, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
              <Typography variant="caption" color="text.secondary">{entry.name}</Typography>
              <Typography variant="caption" fontWeight={600} sx={{ ml: 'auto' }}>{entry.value} ha</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
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
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickMargin={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickMargin={4}
          domain={[0, maxValue]}
          tickFormatter={(v) => Math.round(v / 1000) + 'k'}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.3)' }} />
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
